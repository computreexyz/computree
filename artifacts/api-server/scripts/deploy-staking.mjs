/* Deploy TokenizedNVDA + ComputreeStaking to Robinhood Chain mainnet,     */
/* then smoke-test faucet/approve/stake from the dev wallet.               */
/* Secrets are read from ../.env at runtime and never printed.             */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import solc from 'solc';
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  formatEther,
  http,
  parseEther,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

/* ------------------------------ env ----------------------------------- */

const env = {};
for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
if (!env.DEV_WALLET_PRIVATE_KEY) throw new Error('DEV_WALLET_PRIVATE_KEY missing in .env');

const RPC_URL = 'https://rpc.mainnet.chain.robinhood.com';
const EXPLORER = 'https://robinhoodchain.blockscout.com';

const robinhoodChain = defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
  blockExplorers: { default: { name: 'Blockscout', url: EXPLORER } },
});

/* ---------------------------- compile ---------------------------------- */

function compileContract(file) {
  const source = fs.readFileSync(path.join(root, 'contracts', file), 'utf8');
  const input = {
    language: 'Solidity',
    sources: { [file]: { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } },
    },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  for (const err of output.errors ?? []) {
    if (err.severity === 'error') throw new Error(`solc: ${err.formattedMessage}`);
  }
  const name = file.replace('.sol', '');
  const artifact = output.contracts[file][name];
  return { abi: artifact.abi, bytecode: `0x${artifact.evm.bytecode.object}` };
}

console.log('compiling contracts…');
const token = compileContract('TokenizedNVDA.sol');
const staking = compileContract('ComputreeStaking.sol');
console.log('compiled OK (solc', solc.version() + ')');

/* ---------------------------- clients ---------------------------------- */

const rawKey = env.DEV_WALLET_PRIVATE_KEY.trim();
const account = privateKeyToAccount(rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`);
const transport = http(RPC_URL);
const publicClient = createPublicClient({ chain: robinhoodChain, transport });
const walletClient = createWalletClient({ account, chain: robinhoodChain, transport });

console.log('deployer:', account.address);
const ethBalance = await publicClient.getBalance({ address: account.address });
console.log('deployer ETH balance:', formatEther(ethBalance), 'ETH');

async function waitTx(hash, label) {
  const receipt = await publicClient.waitForTransactionReceipt({ hash, pollingInterval: 2_000 });
  console.log(`${label}: tx ${hash}`);
  console.log(`  block ${receipt.blockNumber} · ${EXPLORER}/tx/${hash}`);
  if (receipt.status !== 'success') throw new Error(`${label} reverted`);
  return receipt;
}

/* ----------------------------- deploy ---------------------------------- */

console.log('\ndeploying TokenizedNVDA…');
const tokenHash = await walletClient.deployContract({ abi: token.abi, bytecode: token.bytecode });
const tokenReceipt = await waitTx(tokenHash, 'TokenizedNVDA deploy');
const tokenAddress = tokenReceipt.contractAddress;
console.log('  address:', tokenAddress);
console.log(`  ${EXPLORER}/address/${tokenAddress}`);

console.log('\ndeploying ComputreeStaking…');
const stakingHash = await walletClient.deployContract({
  abi: staking.abi,
  bytecode: staking.bytecode,
  args: [tokenAddress],
});
const stakingReceipt = await waitTx(stakingHash, 'ComputreeStaking deploy');
const stakingAddress = stakingReceipt.contractAddress;
console.log('  address:', stakingAddress);
console.log(`  ${EXPLORER}/address/${stakingAddress}`);

/* ---------------------------- smoke test -------------------------------- */

const STAKE = parseEther('1000');

console.log('\nsmoke test: faucet → approve → stake 1,000 NVDA…');
const faucetHash = await walletClient.writeContract({
  address: tokenAddress, abi: token.abi, functionName: 'faucet',
});
await waitTx(faucetHash, 'token.faucet()');

const approveHash = await walletClient.writeContract({
  address: tokenAddress, abi: token.abi, functionName: 'approve',
  args: [stakingAddress, STAKE],
});
await waitTx(approveHash, 'token.approve(vault, 1000e18)');

const stakeHash = await walletClient.writeContract({
  address: stakingAddress, abi: staking.abi, functionName: 'stake',
  args: [STAKE],
});
await waitTx(stakeHash, 'staking.stake(1000e18)');

const [staked, totalStaked, tokenBalance] = await Promise.all([
  publicClient.readContract({
    address: stakingAddress, abi: staking.abi, functionName: 'stakedBalanceOf', args: [account.address],
  }),
  publicClient.readContract({
    address: stakingAddress, abi: staking.abi, functionName: 'totalStaked',
  }),
  publicClient.readContract({
    address: tokenAddress, abi: token.abi, functionName: 'balanceOf', args: [account.address],
  }),
]);

console.log('\non-chain state:');
console.log('  stakedBalanceOf(deployer):', formatEther(staked), 'NVDA');
console.log('  totalStaked:', formatEther(totalStaked), 'NVDA');
console.log('  token balanceOf(deployer):', formatEther(tokenBalance), 'NVDA');

/* --------------------------- persist .env ------------------------------- */

function upsertEnv(key, value) {
  const envPath = path.join(root, '.env');
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
  if (idx >= 0) lines[idx] = `${key}=${value}`;
  else lines.push(`${key}=${value}`);
  fs.writeFileSync(envPath, lines.join('\n'));
}

upsertEnv('STAKE_TOKEN_ADDRESS', tokenAddress);
upsertEnv('STAKE_VAULT_ADDRESS', stakingAddress);
console.log('\n.env updated: STAKE_TOKEN_ADDRESS + STAKE_VAULT_ADDRESS set (values not printed here)');
console.log('\nDEPLOYED:');
console.log('  TokenizedNVDA:    ', tokenAddress);
console.log('  ComputreeStaking: ', stakingAddress);
