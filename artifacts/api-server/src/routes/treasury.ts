import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/", (_req, res) => {
  res.json({
    stats: {
      balanceUsd: 4_820_000,
      compute30dUsd: 312_400,
      activeGpuCapacity: 214,
      avgCostPerCr: 0.41,
      note: "awaiting on-chain integration — values are placeholders",
    },
    transactions: [],
  });
});

export default router;
