import { Router, type IRouter } from "express";
import { getAccount, requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/", (req, res) => {
  const account = getAccount(req);
  res.json({
    account: {
      id: account.id,
      privyDid: account.privyDid,
      walletAddress: account.walletAddress,
    },
    eligibility: {
      eligible: true,
      balanceCtree: 12400,
      reason: "mock-balance-until-onchain",
    },
  });
});

export default router;
