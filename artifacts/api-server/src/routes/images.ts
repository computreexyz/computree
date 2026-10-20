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
import { ensureAllocation } from "../lib/allocations";
import { redactUpstreamText } from "../lib/upstream";
import { newJobId, utcToday } from "../lib/metering";

const router: IRouter = Router();

router.use(requireAuth);

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const CREDITS_PER_IMAGE = 10;
const DEFAULT_MODEL = "google/gemini-2.5-flash-image";
const FALLBACK_MODELS = ["openai/gpt-5-image-mini", "bytedance/seedream-4.0"];

const generateSchema = z.object({
  prompt: z.string().min(1).max(2000),
  model: z.string().min(1).optional(),
  count: z.union([z.literal(1), z.literal(2)]).default(1),
});

interface ImageMessage {
  content?: string | null;
  images?: Array<{ image_url?: { url?: string } }>;
}

interface ImageCompletion {
  model?: string;
  choices?: Array<{ message?: ImageMessage }>;
}

async function callImageModel(
  model: string,
  prompt: string,
): Promise<{ ok: true; data: ImageCompletion } | { ok: false; status: number; message: string }> {
  const upstream = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://computree.xyz",
      "X-Title": "Computree",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
      stream: false,
    }),
  });
  if (!upstream.ok) {
    const errBody = await upstream.text();
    let message = `upstream error ${upstream.status}`;
    try {
      const parsedErr = JSON.parse(errBody) as { error?: { message?: string } };
      if (typeof parsedErr?.error?.message === "string") message = redactUpstreamText(parsedErr.error.message);
    } catch {
      if (errBody) message = redactUpstreamText(errBody.slice(0, 500));
    }
    return { ok: false, status: upstream.status, message };
  }
  return { ok: true, data: (await upstream.json()) as ImageCompletion };
}

router.post("/generate", async (req, res, next) => {
  const startedAt = new Date();
  const account = getAccount(req);
  let model = DEFAULT_MODEL;
  try {
    const parsed = generateSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: parsed.error.issues[0]?.message ?? "invalid request body" });
      return;
    }

    const cycleDate = utcToday();
    const allocation = await ensureAllocation(account.id, cycleDate, 1000);
    const maxCost = CREDITS_PER_IMAGE * parsed.data.count;
    if (allocation.used >= allocation.total) {
      res.status(429).json({ error: "daily allocation exhausted" });
      return;
    }
    const remainingBefore = allocation.total - allocation.used;
    if (remainingBefore < maxCost) {
      res.status(429).json({
        error: "Not enough credits for image generation",
        code: "INSUFFICIENT_CREDITS",
        remaining: remainingBefore,
      });
      return;
    }

    const candidates = [
      parsed.data.model ?? DEFAULT_MODEL,
      ...FALLBACK_MODELS.filter((m) => m !== (parsed.data.model ?? DEFAULT_MODEL)),
    ];

    // Image models return one image per call - one call per requested image,
    // each with its own fallback chain.
    const images: string[] = [];
    let text: string | undefined;
    let usedModel = candidates[0];
    let lastError = "";
    let lastStatus = 502;
    for (let i = 0; i < parsed.data.count; i++) {
      let got: string | null = null;
      for (const candidate of candidates) {
        const attempt = await callImageModel(candidate, parsed.data.prompt);
        if (attempt.ok) {
          const message = attempt.data.choices?.[0]?.message;
          const urls = (message?.images ?? [])
            .map((img) => img.image_url?.url)
            .filter((url): url is string => typeof url === "string" && url.length > 0);
          if (urls.length > 0) {
            got = urls[0];
            usedModel = candidate;
            if (!text && typeof message?.content === "string" && message.content.length > 0) {
              text = message.content;
            }
            break;
          }
          lastError = `${candidate} returned no images`;
          lastStatus = 502;
        } else {
          lastError = attempt.message;
          lastStatus = attempt.status;
        }
      }
      if (got) images.push(got);
      else break;
    }

    const completedAt = new Date();
    const durationSec = Math.max(
      1,
      Math.round((completedAt.getTime() - startedAt.getTime()) / 1000),
    );

    if (images.length === 0) {
      await db.insert(jobsTable).values({
        id: newJobId(),
        accountId: account.id,
        apiKeyId: null,
        model: usedModel,
        gpu: "H100",
        provider: "image",
        status: "failed",
        durationSec,
        error: lastError,
        startedAt,
        completedAt,
      });
      res.status(lastStatus).json({ error: lastError });
      return;
    }

    model = usedModel;
    const cost = CREDITS_PER_IMAGE * images.length;

    const [updated] = await db
      .update(allocationsTable)
      .set({ used: sql`${allocationsTable.used} + ${cost}` })
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
      provider: "image",
      status: "completed",
      durationSec,
      credits: String(cost),
      startedAt,
      completedAt,
    });

    await db
      .insert(usageDailyTable)
      .values({ accountId: account.id, date: cycleDate, credits: String(cost), jobs: 1 })
      .onConflictDoUpdate({
        target: [usageDailyTable.accountId, usageDailyTable.date],
        set: {
          credits: sql`${usageDailyTable.credits} + ${cost}`,
          jobs: sql`${usageDailyTable.jobs} + 1`,
        },
      });

    const remaining = Math.max(0, updated.total - updated.used);
    res.set("x-ctree-credits-used", String(cost));
    res.set("x-ctree-remaining", String(remaining));
    res.json({ images, ...(text ? { text } : {}), model, creditsUsed: cost, remaining });
  } catch (err) {
    next(err);
  }
});

export default router;
