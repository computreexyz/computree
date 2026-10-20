import { Router, type IRouter } from "express";
import { getAccount, requireAuth } from "../lib/auth";
import { ensureAllocation } from "../lib/allocations";
import { utcMidnightMs } from "../lib/metering";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const account = getAccount(req);
    const allocation = await ensureAllocation(account.id, undefined, 1000);
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
