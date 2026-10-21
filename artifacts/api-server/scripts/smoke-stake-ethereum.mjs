/* One-off smoke test on Ethereum mainnet: approve + stake a small NVDAon */
/* amount into the ComputreeStaking vault from the dev wallet, then read  */
/* the position back. Secrets from ../.env, never printed.                */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPublicClient, createWalletClient, formatUnits, http, parseUnits } from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const TOKEN = '0x2d1f7226bd1f780af6b9a49dcc0ae00e8df4bdee';
const VAULT = '0xc3d3e456eaa5d835484c4e457190f5d9d53843f1';
const AMOUNT = parseUnits('0.01', 18);

const erc20Abi = [
  { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'a', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'allowance', stateMutability: 'view', inputs: [{ name: 'o', type: 'address' }, { name: 's', type: 'address' }], outputs: [{ type: 'uint256' }] },
];
const vaultAbi = [
  { type: 'function', name: 'stake', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'unstake', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'stakedBalanceOf', stateMutability: 'view', inputs: [{ name: 'a', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'totalStaked', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
];

const env = {};
for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
if (!env.DEV_WALLET_PRIVATE_KEY) throw new Error('DEV_WALLET_PRIVATE_KEY missing in .env');

const rawKey = env.DEV_WALLET_PRIVATE_KEY.trim();
const account = privateKeyToAccount(rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`);
const transport = http('https://ethereum.publicnode.com');
const publicClient = createPublicClient({ chain: mainnet, transport });
const walletClient = createWalletClient({ account, chain: mainnet, transport });

console.log('wallet:', account.address);
const [balance, stakedBefore] = await Promise.all([
  publicClient.readContract({ address: TOKEN, abi: erc20Abi, functionName: 'balanceOf', args: [account.address] }),
  publicClient.readContract({ address: VAULT, abi: vaultAbi, functionName: 'stakedBalanceOf', args: [account.address] }),
]);
console.log('NVDAon balance:', formatUnits(balance, 18), '| staked before:', formatUnits(stakedBefore, 18));
if (balance < AMOUNT) throw new Error('insufficient NVDAon balance');

async function waitTx(hash, label) {
  console.log(`${label}: https://etherscan.io/tx/${hash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash, pollingInterval: 4_000 });
  if (receipt.status !== 'success') throw new Error(`${label} reverted`);
  console.log(`  confirmed in block ${receipt.blockNumber} · gasUsed ${receipt.gasUsed}`);
}

const approveHash = await walletClient.writeContract({
  address: TOKEN, abi: erc20Abi, functionName: 'approve', args: [VAULT, AMOUNT],
});
await waitTx(approveHash, 'approve(vault, 0.01 NVDAon)');

const stakeHash = await walletClient.writeContract({
  address: VAULT, abi: vaultAbi, functionName: 'stake', args: [AMOUNT],
});
await waitTx(stakeHash, 'stake(0.01 NVDAon)');

const [stakedAfter, totalStaked, balanceAfter] = await Promise.all([
  publicClient.readContract({ address: VAULT, abi: vaultAbi, functionName: 'stakedBalanceOf', args: [account.address] }),
  publicClient.readContract({ address: VAULT, abi: vaultAbi, functionName: 'totalStaked' }),
  publicClient.readContract({ address: TOKEN, abi: erc20Abi, functionName: 'balanceOf', args: [account.address] }),
]);
console.log('\nfinal state:');
console.log('  stakedBalanceOf(wallet):', formatUnits(stakedAfter, 18), 'NVDAon');
console.log('  totalStaked:            ', formatUnits(totalStaked, 18), 'NVDAon');
console.log('  wallet balance:         ', formatUnits(balanceAfter, 18), 'NVDAon');
