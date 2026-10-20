import { Router, type IRouter } from "express";
import { providersTable } from "@workspace/db/schema";
import { db } from "../lib/db";

const router: IRouter = Router();

router.get("/", async (_req, res, next) => {
  try {
    const rows = await db.select().from(providersTable);
    res.json(
      rows.map((p) => ({
        name: p.name,
        gpuClass: p.gpuClass,
        online: p.online,
        capacityPct: p.capacityPct,
        jobs24h: p.jobs24h,
      })),
    );
  } catch (err) {
    next(err);
  }
});

export default router;
