import { defineChain } from 'viem';

/**
 * Robinhood Chain (Arbitrum Orbit L2) - home of staked tokenized assets.
 *
 * NOTE: these are the official mainnet parameters as announced.
 */
export const robinhoodChain = defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.mainnet.chain.robinhood.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://robinhoodchain.blockscout.com',
    },
  },
});

export const EXPLORER_TX_URL = (tx: string) =>
  `${robinhoodChain.blockExplorers.default.url}/tx/${tx}`;
