import { Router, type IRouter } from "express";
import { getAccount, requireAuth } from "../lib/auth";
import { ensureAllocation } from "../lib/allocations";
import { utcMidnightMs } from "../lib/metering";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const allocation = await ensureAllocation(getAccount(req).id);
    res.json({
      used: allocation.used,
      total: allocation.total,
      cycleStartedAt: utcMidnightMs(allocation.cycleDate),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
