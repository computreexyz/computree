import { createPublicClient, http, parseUnits, type Address } from 'viem';
import { appChain } from '../chain';

/* Live Ethereum mainnet deployments (Chain ID 1). */
export const STAKE_TOKEN_ADDRESS = '0x2d1f7226bd1f780af6b9a49dcc0ae00e8df4bdee' as const;
export const STAKE_VAULT_ADDRESS = '0xc3d3e456eaa5d835484c4e457190f5d9d53843f1' as const;
export const EXPLORER_URL = 'https://etherscan.io';

export const stakeTokenAbi = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;

export const stakingVaultAbi = [
  {
    type: 'function',
    name: 'stake',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'unstake',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'stakedBalanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'totalStaked',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export const stakingPublicClient = createPublicClient({
  chain: appChain,
  transport: http(),
});

/** uint256 (18dp) → whole-token number floored to 2 decimals. */
export function toTokenUnits(value: bigint): number {
  return Number((value * 100n) / 10n ** 18n) / 100;
}

/** Parse a user-typed NVDA amount; null when invalid or ≤ 0. */
export function parseNvdaAmount(input: string): bigint | null {
  try {
    const value = parseUnits(input.trim(), 18);
    return value > 0n ? value : null;
  } catch {
    return null;
  }
}

export interface StakingPosition {
  walletBalance: number;
  stakedBalance: number;
  totalStaked: number;
}

export async function readStakingPosition(account: Address): Promise<StakingPosition> {
  const [walletBalance, stakedBalance, totalStaked] = await Promise.all([
    stakingPublicClient.readContract({
      address: STAKE_TOKEN_ADDRESS,
      abi: stakeTokenAbi,
      functionName: 'balanceOf',
      args: [account],
    }),
    stakingPublicClient.readContract({
      address: STAKE_VAULT_ADDRESS,
      abi: stakingVaultAbi,
      functionName: 'stakedBalanceOf',
      args: [account],
    }),
    stakingPublicClient.readContract({
      address: STAKE_VAULT_ADDRESS,
      abi: stakingVaultAbi,
      functionName: 'totalStaked',
    }),
  ]);
  return {
    walletBalance: toTokenUnits(walletBalance),
    stakedBalance: toTokenUnits(stakedBalance),
    totalStaked: toTokenUnits(totalStaked),
  };
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

export const addressUrl = (address: string) => `${EXPLORER_URL}/address/${address}`;
export const txUrl = (hash: string) => `${EXPLORER_URL}/tx/${hash}`;

/** Short human-readable reason from a viem/wallet error. */
export function txErrorReason(err: unknown): string {
  if (err && typeof err === 'object' && 'shortMessage' in err) {
    const short = (err as { shortMessage?: unknown }).shortMessage;
    if (typeof short === 'string') return short.slice(0, 140);
  }
  return err instanceof Error ? err.message.slice(0, 140) : 'Transaction failed';
}
