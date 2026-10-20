import { Router, type IRouter } from "express";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import {
  allocationsTable,
  jobsTable,
} from "@workspace/db/schema";
import { getAccount, requireAuth } from "../lib/auth";
import { db } from "../lib/db";
import { utcMidnightMs, utcToday } from "../lib/metering";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/hourly", async (req, res, next) => {
  try {
    const rows = await db
      .select({
        hour: sql<number>`extract(hour from ${jobsTable.createdAt} at time zone 'UTC')`,
        credits: sql<string>`coalesce(sum(${jobsTable.credits}), 0)`,
      })
      .from(jobsTable)
      .where(
        and(
          eq(jobsTable.accountId, getAccount(req).id),
          gte(jobsTable.createdAt, new Date(utcMidnightMs(utcToday()))),
        ),
      )
      .groupBy(sql`extract(hour from ${jobsTable.createdAt} at time zone 'UTC')`);

    const byHour = new Map(rows.map((r) => [Number(r.hour), parseFloat(r.credits)]));
    const out = [];
    for (let h = 0; h < 24; h++) {
      out.push({
        hour: `${String(h).padStart(2, "0")}:00`,
        credits: Math.round((byHour.get(h) ?? 0) * 10) / 10,
      });
    }
    res.json(out);
  } catch (err) {
    next(err);
  }
});

router.get("/week", async (req, res, next) => {
  try {
    const days: string[] = [];
    for (let d = 6; d >= 0; d--) {
      days.push(new Date(Date.now() - d * 86_400_000).toISOString().slice(0, 10));
    }
    const rows = await db
      .select()
      .from(allocationsTable)
      .where(
        and(
          eq(allocationsTable.accountId, getAccount(req).id),
          inArray(allocationsTable.cycleDate, days),
        ),
      );
    const byDate = new Map(rows.map((r) => [r.cycleDate, r]));
    res.json(
      days.map((date) => {
        const row = byDate.get(date);
        return { date, used: row?.used ?? 0, total: row?.total ?? 1000 };
      }),
    );
  } catch (err) {
    next(err);
  }
});

export default router;
