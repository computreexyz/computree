import { defineChain } from 'viem';

/** Ethereum mainnet - home of the NVDAon staking vault. */
export const appChain = defineChain({
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://ethereum.publicnode.com', 'https://rpc.mevblocker.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
    },
  },
});

export const EXPLORER_TX_URL = (tx: string) =>
  `${appChain.blockExplorers.default.url}/tx/${tx}`;
