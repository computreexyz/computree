import { Router, type IRouter } from "express";
import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import {
  accountsTable,
  allocationsTable,
  apiKeysTable,
  jobsTable,
  usageDailyTable,
  type ApiKey,
} from "@workspace/db/schema";
import { db } from "../lib/db";
import { redactUpstreamText, upstreamModel } from "../lib/upstream";
import { logger } from "../lib/logger";
import { ensureAllocation } from "../lib/allocations";
import {
  creditsForUsage,
  newJobId,
  sha256Hex,
  utcToday,
} from "../lib/metering";

const router: IRouter = Router();

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const chatCompletionsSchema = z
  .object({
    model: z.string().min(1),
    messages: z
      .array(z.object({ role: z.string() }).passthrough())
      .min(1),
  })
  .passthrough();

async function resolveApiKey(secret: string): Promise<ApiKey | null> {
  const hash = sha256Hex(secret);
  const [key] = await db
    .select()
    .from(apiKeysTable)
    .where(
      and(eq(apiKeysTable.keyHash, hash), isNull(apiKeysTable.revokedAt)),
    )
    .limit(1);
  if (!key) return null;
  await db
    .update(apiKeysTable)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeysTable.id, key.id));
  return key;
}

router.post("/chat/completions", async (req, res, next) => {
  const startedAt = new Date();
  let key: ApiKey | null = null;
  let model = "unknown";
  try {
    const header = req.header("authorization");
    if (!header || !header.startsWith("Bearer ")) {
      res.status(401).json({ error: "missing or malformed Authorization header" });
      return;
    }
    key = await resolveApiKey(header.slice(7));
    if (!key) {
      res.status(401).json({ error: "invalid or revoked api key" });
      return;
    }

    const parsed = chatCompletionsSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: parsed.error.issues[0]?.message ?? "invalid request body" });
      return;
    }
    model = parsed.data.model;

    const [account] = await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.id, key.accountId))
      .limit(1);
    if (!account) {
      res.status(401).json({ error: "api key has no associated account" });
      return;
    }
    const cycleDate = utcToday();
    const allocation = await ensureAllocation(key.accountId, cycleDate, 1000);
    if (allocation.used >= allocation.total) {
      res.status(429).json({ error: "daily allocation exhausted" });
      return;
    }

    // Streaming is not metered yet — always request a non-streaming response.
    const payload = { ...parsed.data, model: upstreamModel(parsed.data.model), stream: false };

    const upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://computree.xyz",
        "X-Title": "Computree",
      },
      body: JSON.stringify(payload),
    });

    const completedAt = new Date();
    const durationSec = Math.max(
      1,
      Math.round((completedAt.getTime() - startedAt.getTime()) / 1000),
    );

    if (!upstream.ok) {
      const errBody = await upstream.text();
      let message = `upstream error ${upstream.status}`;
      let parsedErr: unknown = null;
      try {
        parsedErr = JSON.parse(errBody);
        const m = (parsedErr as { error?: { message?: string } })?.error?.message;
        if (typeof m === "string") message = redactUpstreamText(m);
      } catch {
        if (errBody) message = redactUpstreamText(errBody.slice(0, 500));
      }
      await db.insert(jobsTable).values({
        id: newJobId(),
        accountId: key.accountId,
        apiKeyId: key.id,
        model,
        gpu: "H100",
        provider: "inference",
        status: "failed",
        durationSec,
        error: message,
        startedAt,
        completedAt,
      });
      res.status(upstream.status).json(parsedErr ?? { error: message });
      return;
    }

    const data = (await upstream.json()) as {
      model?: string;
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
      };
    };
    const credits = creditsForUsage(data.usage);
    const jobModel = data.model ?? model;

    const [updated] = await db
      .update(allocationsTable)
      .set({ used: sql`${allocationsTable.used} + ${credits}` })
      .where(
        and(
          eq(allocationsTable.accountId, key.accountId),
          eq(allocationsTable.cycleDate, cycleDate),
        ),
      )
      .returning();

    await db.insert(jobsTable).values({
      id: newJobId(),
      accountId: key.accountId,
      apiKeyId: key.id,
      model: jobModel,
      gpu: "H100",
      provider: "inference",
      status: "completed",
      durationSec,
      credits: String(credits),
      tokensIn: data.usage?.prompt_tokens ?? null,
      tokensOut: data.usage?.completion_tokens ?? null,
      startedAt,
      completedAt,
    });

    await db
      .insert(usageDailyTable)
      .values({
        accountId: key.accountId,
        date: cycleDate,
        credits: String(credits),
        jobs: 1,
      })
      .onConflictDoUpdate({
        target: [usageDailyTable.accountId, usageDailyTable.date],
        set: {
          credits: sql`${usageDailyTable.credits} + ${credits}`,
          jobs: sql`${usageDailyTable.jobs} + 1`,
        },
      });

    const remaining = Math.max(0, updated.total - updated.used);
    res.set("x-ctree-credits-used", String(credits));
    res.set("x-ctree-remaining", String(remaining));
    res.json(data);
  } catch (err) {
    if (key) {
      try {
        await db.insert(jobsTable).values({
          id: newJobId(),
          accountId: key.accountId,
          apiKeyId: key.id,
          model,
          gpu: "H100",
          provider: "inference",
          status: "failed",
          error: err instanceof Error ? redactUpstreamText(err.message) : String(err),
          startedAt,
          completedAt: new Date(),
        });
      } catch (insertErr) {
        logger.error({ err: insertErr }, "failed to record failed job");
      }
    }
    next(err);
  }
});

export default router;
