import { defineChain } from 'viem';

/**
 * Robinhood Chain (Arbitrum Orbit L2) — home of $CTREE.
 *
 * NOTE: these are the public testnet parameters as announced; confirm
 * against the official Robinhood Chain docs before mainnet launch.
 */
export const robinhoodChain = defineChain({
  id: 46630,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.chain.robinhood.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Robinhood Chain Explorer',
      url: 'https://explorer.testnet.chain.robinhood.com',
    },
  },
  testnet: true,
});

export const EXPLORER_TX_URL = (tx: string) =>
  `${robinhoodChain.blockExplorers.default.url}/tx/${tx}`;
