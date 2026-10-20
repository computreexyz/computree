import type { Request } from "express";
import type { Account } from "@workspace/db/schema";
import { getPrivy } from "./auth";
import { logger } from "./logger";

const RPC_URL = "https://rpc.mainnet.chain.robinhood.com";
const BALANCE_OF_SELECTOR = "0x70a08231";
const ELIGIBILITY_THRESHOLD = 1000;
const STAKE_ASSET_LABEL = "tokenized NVDA";

export interface Eligibility {
  eligible: boolean;
  balance: number;
  asset: string;
  staked: number;
}

const WALLET_HEADER_RE = /^0x[0-9a-fA-F]{40}$/;

const walletCache = new Map<string, { address: string | null; expiresAt: number }>();

async function fetchPrivyWallet(privyDid: string): Promise<string | null> {
  const cached = walletCache.get(privyDid);
  if (cached && cached.expiresAt > Date.now()) return cached.address;
  let address: string | null = null;
  try {
    const user = await getPrivy().getUser(privyDid);
    const linked = user.linkedAccounts as Array<{ type: string; address?: string }>;
    const wallet = linked.find((a) => a.type === "wallet" && a.address);
    const smartWallet = linked.find((a) => a.type === "smart_wallet" && a.address);
    address = wallet?.address ?? smartWallet?.address ?? null;
  } catch (err) {
    logger.warn({ err, privyDid }, "failed to fetch wallet from Privy");
  }
  walletCache.set(privyDid, { address, expiresAt: Date.now() + 60_000 });
  return address;
}

/** Wallet to check staked balances against: explicit header in demo/dev, else Privy. */
export async function getWalletAddress(
  account: Account,
  req: Request,
): Promise<string | null> {
  const header = req.header("x-wallet-address");
  if (process.env.DEMO_AUTH === "1" && header && WALLET_HEADER_RE.test(header)) {
    return header.toLowerCase();
  }
  return fetchPrivyWallet(account.privyDid);
}

/** Staked tokenized-asset balance (whole units, floored to 2 decimals). 0 until staking is live. */
export async function getAssetBalance(address: string): Promise<number> {
  const token = process.env.STAKE_TOKEN_ADDRESS;
  if (!token) return 0;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6_000);
  try {
    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [
          {
            to: token,
            data: BALANCE_OF_SELECTOR + address.slice(2).toLowerCase().padStart(64, "0"),
          },
          "latest",
        ],
      }),
      signal: controller.signal,
    });
    const data = (await res.json()) as { result?: string; error?: { message?: string } };
    if (data.error || typeof data.result !== "string") {
      throw new Error(data.error?.message ?? "malformed eth_call response");
    }
    if (data.result === "0x" || data.result === "0x0") return 0;
    const wei = BigInt(data.result);
    const hundredths = (wei * 100n) / 10n ** 18n;
    return Number(hundredths) / 100;
  } catch (err) {
    logger.warn({ err, address }, "staked balance lookup failed, treating as 0");
    return 0;
  } finally {
    clearTimeout(timer);
  }
}

function eligibilityOf(balance: number): Eligibility {
  return {
    eligible: balance >= ELIGIBILITY_THRESHOLD,
    balance,
    asset: STAKE_ASSET_LABEL,
    staked: balance,
  };
}

export async function getEligibility(account: Account, req: Request): Promise<Eligibility> {
  if (process.env.DEMO_AUTH === "1") {
    // Demo/dev stays usable without a wallet; an explicit wallet header
    // opts into the real staked-balance check instead.
    const header = req.header("x-wallet-address");
    if (!header) return eligibilityOf(12400);
  }
  const address = await getWalletAddress(account, req);
  if (!address) return eligibilityOf(0);
  return eligibilityOf(await getAssetBalance(address));
}
