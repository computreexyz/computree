import { Router, type IRouter } from "express";
import { and, desc, eq, type SQL } from "drizzle-orm";
import { jobsTable, type Job } from "@workspace/db/schema";
import { getAccount, requireAuth } from "../lib/auth";
import { db } from "../lib/db";

const router: IRouter = Router();

router.use(requireAuth);

function shapeJob(job: Job) {
  return {
    id: job.id,
    model: job.model,
    gpu: job.gpu,
    status: job.status,
    provider: job.provider ?? "openrouter",
    durationSec: job.durationSec ?? 0,
    credits: job.credits ? parseFloat(job.credits) : 0,
    startedAt: (job.startedAt ?? job.createdAt).getTime(),
    tokensIn: job.tokensIn ?? 0,
    tokensOut: job.tokensOut ?? 0,
    ...(job.error ? { error: job.error } : {}),
  };
}

router.get("/", async (req, res, next) => {
  try {
    const conditions: SQL[] = [eq(jobsTable.accountId, getAccount(req).id)];
    if (typeof req.query.status === "string" && req.query.status) {
      conditions.push(eq(jobsTable.status, req.query.status));
    }
    if (typeof req.query.model === "string" && req.query.model) {
      conditions.push(eq(jobsTable.model, req.query.model));
    }
    if (typeof req.query.gpu === "string" && req.query.gpu) {
      conditions.push(eq(jobsTable.gpu, req.query.gpu));
    }
    if (typeof req.query.provider === "string" && req.query.provider) {
      conditions.push(eq(jobsTable.provider, req.query.provider));
    }
    const limitRaw = Number(req.query.limit ?? 50);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(1, Math.floor(limitRaw)), 200)
      : 50;

    const jobs = await db
      .select()
      .from(jobsTable)
      .where(and(...conditions))
      .orderBy(desc(jobsTable.createdAt))
      .limit(limit);

    res.json(jobs.map(shapeJob));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const [job] = await db
      .select()
      .from(jobsTable)
      .where(
        and(
          eq(jobsTable.id, req.params.id),
          eq(jobsTable.accountId, getAccount(req).id),
        ),
      )
      .limit(1);
    if (!job) {
      res.status(404).json({ error: "job not found" });
      return;
    }
    res.json(shapeJob(job));
  } catch (err) {
    next(err);
  }
});

export default router;
