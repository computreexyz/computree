import type { Request } from "express";
import {
  createPublicClient,
  fallback,
  http,
  type Address,
  type PublicClient,
} from "viem";
import { mainnet } from "viem/chains";
import type { Account } from "@workspace/db/schema";
import { getPrivy } from "./auth";
import { logger } from "./logger";

// Ethereum mainnet RPCs - first healthy endpoint answers.
const RPC_URLS = [
  "https://rpc.mevblocker.io",
  "https://ethereum.publicnode.com",
  "https://eth.llamarpc.com",
];
const STAKE_ASSET_LABEL = "tokenized NVDA";
// Minimum staked NVDAon required for access. Default 0 = any positive stake.
const MIN_STAKE = Number(process.env.STAKE_MIN_NVDA ?? "0");

const stakingAbi = [
  {
    type: "function",
    name: "stakedBalanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

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

let chainClient: PublicClient | null = null;

function getChainClient(): PublicClient {
  if (!chainClient) {
    chainClient = createPublicClient({
      chain: mainnet,
      transport: fallback(
        RPC_URLS.map((url) => http(url, { timeout: 6_000 })),
      ),
    });
  }
  return chainClient;
}

/** Staked balance in the ComputreeStaking vault (whole units, floored to 2 decimals). */
export async function getStakedBalance(address: string): Promise<number> {
  const vault = process.env.STAKE_VAULT_ADDRESS;
  if (!vault) return 0;
  try {
    const raw = await getChainClient().readContract({
      address: vault as Address,
      abi: stakingAbi,
      functionName: "stakedBalanceOf",
      args: [address as Address],
    });
    const hundredths = (raw * 100n) / 10n ** 18n;
    return Number(hundredths) / 100;
  } catch (err) {
    logger.warn({ err, address }, "staked balance lookup failed, treating as 0");
    return 0;
  }
}

function eligibilityOf(balance: number): Eligibility {
  return {
    eligible: balance > MIN_STAKE,
    balance,
    asset: STAKE_ASSET_LABEL,
    staked: balance,
  };
}

export async function getEligibility(account: Account, req: Request): Promise<Eligibility> {
  if (process.env.DEMO_AUTH === "1") {
    // Demo/dev simulates unlocked access without a wallet; an explicit
    // wallet header opts into the real staked-balance check instead.
    const header = req.header("x-wallet-address");
    if (!header) return { ...eligibilityOf(0), eligible: true };
  }
  const address = await getWalletAddress(account, req);
  if (!address) return eligibilityOf(0);
  return eligibilityOf(await getStakedBalance(address));
}
