import { Router, type IRouter } from "express";
import healthRouter from "./health";
import meRouter from "./me";
import allocationRouter from "./allocation";
import jobsRouter from "./jobs";
import keysRouter from "./keys";
import providersRouter from "./providers";
import treasuryRouter from "./treasury";
import usageRouter from "./usage";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/me", meRouter);
router.use("/allocation", allocationRouter);
router.use("/jobs", jobsRouter);
router.use("/keys", keysRouter);
router.use("/providers", providersRouter);
router.use("/treasury", treasuryRouter);
router.use("/usage", usageRouter);

export default router;
