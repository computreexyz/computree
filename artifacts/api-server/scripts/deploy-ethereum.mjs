/* Deploy ComputreeStaking to Ethereum mainnet, pointing at Ondo's        */
/* tokenized NVIDIA (NVDAon). Secrets are read from ../.env at runtime    */
/* and never printed.                                                     */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import solc from 'solc';
import { createPublicClient, createWalletClient, formatEther, http } from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const NVDAON = '0x2d1f7226bd1f780af6b9a49dcc0ae00e8df4bdee';
const EXPLORER = 'https://etherscan.io';

/* ------------------------------ env ----------------------------------- */

const env = {};
for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
if (!env.DEV_WALLET_PRIVATE_KEY) throw new Error('DEV_WALLET_PRIVATE_KEY missing in .env');

/* ---------------------------- compile ---------------------------------- */

const source = fs.readFileSync(path.join(root, 'contracts', 'ComputreeStaking.sol'), 'utf8');
const input = {
  language: 'Solidity',
  sources: { 'ComputreeStaking.sol': { content: source } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } },
  },
};
const output = JSON.parse(solc.compile(JSON.stringify(input)));
for (const err of output.errors ?? []) {
  if (err.severity === 'error') throw new Error(`solc: ${err.formattedMessage}`);
}
const artifact = output.contracts['ComputreeStaking.sol'].ComputreeStaking;
const abi = artifact.abi;
const bytecode = `0x${artifact.evm.bytecode.object}`;
console.log('compiled OK (solc', solc.version() + ')');

/* ---------------------------- clients ---------------------------------- */

const rawKey = env.DEV_WALLET_PRIVATE_KEY.trim();
const account = privateKeyToAccount(rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`);
const transport = http('https://ethereum.publicnode.com');
const publicClient = createPublicClient({ chain: mainnet, transport });
const walletClient = createWalletClient({ account, chain: mainnet, transport });

console.log('deployer:', account.address);
const ethBalance = await publicClient.getBalance({ address: account.address });
console.log('deployer ETH balance:', formatEther(ethBalance), 'ETH');
if (ethBalance === 0n) throw new Error('deployer has no ETH on mainnet');

/* ----------------------------- deploy ---------------------------------- */

console.log('\ndeploying ComputreeStaking(token = NVDAon ' + NVDAON + ')…');
const hash = await walletClient.deployContract({ abi, bytecode, args: [NVDAON] });
console.log('tx:', `${EXPLORER}/tx/${hash}`);
const receipt = await publicClient.waitForTransactionReceipt({ hash, pollingInterval: 4_000 });
if (receipt.status !== 'success') throw new Error('deploy reverted');
const vaultAddress = receipt.contractAddress;
console.log('deployed at block', receipt.blockNumber, '· gasUsed', receipt.gasUsed.toString());
console.log('vault:', vaultAddress);
console.log(`${EXPLORER}/address/${vaultAddress}`);

/* --------------------------- sanity read -------------------------------- */

const boundToken = await publicClient.readContract({
  address: vaultAddress, abi, functionName: 'token',
});
console.log('vault.token():', boundToken);

/* --------------------------- persist .env ------------------------------- */

const envPath = path.join(root, '.env');
const lines = fs.readFileSync(envPath, 'utf8').split('\n');
function upsert(key, value) {
  const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
  if (idx >= 0) lines[idx] = `${key}=${value}`;
  else lines.push(`${key}=${value}`);
}
upsert('STAKE_TOKEN_ADDRESS', NVDAON);
upsert('STAKE_VAULT_ADDRESS', vaultAddress);
fs.writeFileSync(envPath, lines.join('\n'));
console.log('\n.env updated: STAKE_TOKEN_ADDRESS + STAKE_VAULT_ADDRESS set');
