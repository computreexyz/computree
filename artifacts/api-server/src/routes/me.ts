import { Router, type IRouter } from "express";
import { getAccount, requireAuth } from "../lib/auth";
import { getEligibility } from "../lib/eligibility";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const account = getAccount(req);
    const eligibility = await getEligibility(account, req);
    res.json({
      account: {
        id: account.id,
        privyDid: account.privyDid,
        walletAddress: account.walletAddress,
      },
      eligibility,
      chain: { id: 1, name: "Ethereum", testnet: false },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
