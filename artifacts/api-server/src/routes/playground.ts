import { Router, type IRouter } from "express";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  allocationsTable,
  jobsTable,
  usageDailyTable,
} from "@workspace/db/schema";
import { getAccount, requireAuth } from "../lib/auth";
import { db } from "../lib/db";
import { redactUpstreamText, upstreamModel } from "../lib/upstream";
import { ensureAllocation } from "../lib/allocations";
import { getEligibility } from "../lib/eligibility";
import { creditsForUsage, newJobId, utcToday } from "../lib/metering";

const router: IRouter = Router();

router.use(requireAuth);

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const playgroundSchema = z.object({
  model: z.string().min(1),
  system: z.string().max(8000).optional(),
  temperature: z.number().min(0).max(2).default(1),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1)
    .max(20),
});

router.post("/completions", async (req, res, next) => {
  const startedAt = new Date();
  const account = getAccount(req);
  let model = "unknown";
  try {
    const parsed = playgroundSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: parsed.error.issues[0]?.message ?? "invalid request body" });
      return;
    }
    model = parsed.data.model;

    const eligibility = await getEligibility(account, req);
    if (!eligibility.eligible) {
      res.status(429).json({
        error: "No daily allocation - stake tokenized NVDA to unlock compute",
        code: "INELIGIBLE",
      });
      return;
    }

    const cycleDate = utcToday();
    const allocation = await ensureAllocation(
      account.id,
      cycleDate,
      eligibility.eligible ? 1000 : 0,
    );
    if (allocation.used >= allocation.total) {
      res.status(429).json({ error: "daily allocation exhausted" });
      return;
    }

    const messages = [
      ...(parsed.data.system
        ? [{ role: "system" as const, content: parsed.data.system }]
        : []),
      ...parsed.data.messages,
    ];

    const upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://computree.xyz",
        "X-Title": "Computree",
      },
      body: JSON.stringify({
        model: upstreamModel(parsed.data.model),
        messages,
        temperature: parsed.data.temperature,
        stream: false,
      }),
    });

    const completedAt = new Date();
    const durationSec = Math.max(
      1,
      Math.round((completedAt.getTime() - startedAt.getTime()) / 1000),
    );

    if (!upstream.ok) {
      const errBody = await upstream.text();
      let message = `upstream error ${upstream.status}`;
      try {
        const parsedErr = JSON.parse(errBody) as { error?: { message?: string } };
        if (typeof parsedErr?.error?.message === "string") {
          message = redactUpstreamText(parsedErr.error.message);
        }
      } catch {
        if (errBody) message = redactUpstreamText(errBody.slice(0, 500));
      }
      await db.insert(jobsTable).values({
        id: newJobId(),
        accountId: account.id,
        apiKeyId: null,
        model,
        gpu: "H100",
        provider: "playground",
        status: "failed",
        durationSec,
        error: message,
        startedAt,
        completedAt,
      });
      res.status(upstream.status).json({ error: message });
      return;
    }

    const data = (await upstream.json()) as {
      model?: string;
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const credits = creditsForUsage(data.usage);

    const [updated] = await db
      .update(allocationsTable)
      .set({ used: sql`${allocationsTable.used} + ${credits}` })
      .where(
        and(
          eq(allocationsTable.accountId, account.id),
          eq(allocationsTable.cycleDate, cycleDate),
        ),
      )
      .returning();

    await db.insert(jobsTable).values({
      id: newJobId(),
      accountId: account.id,
      apiKeyId: null,
      model: data.model ?? model,
      gpu: "H100",
      provider: "playground",
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
        accountId: account.id,
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
    res.json({
      content: data.choices?.[0]?.message?.content ?? "",
      model: data.model ?? parsed.data.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
      },
      creditsUsed: credits,
      remaining,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
