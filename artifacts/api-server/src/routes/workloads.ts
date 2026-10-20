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
import { redactUpstreamText } from "../lib/upstream";
import { ensureAllocation } from "../lib/allocations";
import { newJobId, utcToday } from "../lib/metering";

const router: IRouter = Router();

router.use(requireAuth);

const OPENROUTER_EMBEDDINGS_URL = "https://openrouter.ai/api/v1/embeddings";
const DEFAULT_MODEL = "openai/text-embedding-3-small";

const embeddingsSchema = z.object({
  model: z.string().min(1).default(DEFAULT_MODEL),
  input: z
    .union([z.string().min(1).max(8000), z.array(z.string().min(1).max(8000)).min(1).max(8)])
    .transform((v) => (Array.isArray(v) ? v : [v])),
});

interface EmbeddingsResponse {
  model?: string;
  data?: Array<{ embedding?: number[] }>;
  usage?: { prompt_tokens?: number; total_tokens?: number };
}

router.post("/embeddings", async (req, res, next) => {
  const startedAt = new Date();
  const account = getAccount(req);
  let model = DEFAULT_MODEL;
  try {
    const parsed = embeddingsSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: parsed.error.issues[0]?.message ?? "invalid request body" });
      return;
    }
    model = parsed.data.model;

    const cycleDate = utcToday();
    const allocation = await ensureAllocation(account.id, cycleDate, 1000);
    if (allocation.used >= allocation.total) {
      res.status(429).json({ error: "daily allocation exhausted" });
      return;
    }

    const upstream = await fetch(OPENROUTER_EMBEDDINGS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://computree.xyz",
        "X-Title": "Computree",
      },
      body: JSON.stringify({ model, input: parsed.data.input }),
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
        if (typeof parsedErr?.error?.message === "string") message = redactUpstreamText(parsedErr.error.message);
      } catch {
        if (errBody) message = redactUpstreamText(errBody.slice(0, 500));
      }
      await db.insert(jobsTable).values({
        id: newJobId(),
        accountId: account.id,
        apiKeyId: null,
        model,
        gpu: "H100",
        provider: "workloads",
        status: "failed",
        durationSec,
        error: message,
        startedAt,
        completedAt,
      });
      res.status(upstream.status).json({ error: message });
      return;
    }

    const data = (await upstream.json()) as EmbeddingsResponse;
    const vectors = (data.data ?? [])
      .map((d) => d.embedding)
      .filter((v): v is number[] => Array.isArray(v));
    const dimensions = vectors[0]?.length ?? 0;
    const tokensUsed = data.usage?.total_tokens ?? data.usage?.prompt_tokens ?? 0;
    const credits = Math.max(1, Math.ceil(tokensUsed / 200));

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
      model,
      gpu: "H100",
      provider: "workloads",
      status: "completed",
      durationSec,
      credits: String(credits),
      tokensIn: tokensUsed,
      startedAt,
      completedAt,
    });

    await db
      .insert(usageDailyTable)
      .values({ accountId: account.id, date: cycleDate, credits: String(credits), jobs: 1 })
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
      model: data.model ?? model,
      dimensions,
      count: vectors.length,
      tokensUsed,
      creditsUsed: credits,
      remaining,
      preview: (vectors[0] ?? []).slice(0, 5),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
