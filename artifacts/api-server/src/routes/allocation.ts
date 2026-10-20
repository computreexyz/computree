import { Router, type IRouter } from "express";
import { getAccount, requireAuth } from "../lib/auth";
import { ensureAllocation } from "../lib/allocations";
import { getEligibility } from "../lib/eligibility";
import { utcMidnightMs } from "../lib/metering";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const account = getAccount(req);
    const eligibility = await getEligibility(account, req);
    const allocation = await ensureAllocation(
      account.id,
      undefined,
      eligibility.eligible ? 1000 : 0,
    );
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
