import { Router, type IRouter } from "express";
import healthRouter from "./health";
import meRouter from "./me";
import allocationRouter from "./allocation";
import jobsRouter from "./jobs";
import keysRouter from "./keys";
import providersRouter from "./providers";
import treasuryRouter from "./treasury";
import usageRouter from "./usage";
import playgroundRouter from "./playground";
import imagesRouter from "./images";
import workloadsRouter from "./workloads";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/me", meRouter);
router.use("/allocation", allocationRouter);
router.use("/jobs", jobsRouter);
router.use("/keys", keysRouter);
router.use("/providers", providersRouter);
router.use("/treasury", treasuryRouter);
router.use("/usage", usageRouter);
router.use("/playground", playgroundRouter);
router.use("/images", imagesRouter);
router.use("/workloads", workloadsRouter);

export default router;
