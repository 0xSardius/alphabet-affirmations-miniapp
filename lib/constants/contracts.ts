// Contract addresses and configuration
export const CONTRACTS = {
  ALPHABET_NFT_V2: {
    address: "0x2C799B2ea94c8112866dde3455f52fcFE084dd16" as const,
    chainId: 8453, // Base Mainnet
    name: "AlphabetAffirmationsNFTV2"
  }
} as const

// Pricing in ETH (Base Mainnet)
export const PRICING = {
  RANDOM_TIER: "0.0003", // $0.99 equivalent 
  CUSTOM_TIER: "0.0015"  // $5.00 equivalent
} as const

// Chain configuration
export const CHAINS = {
  BASE_MAINNET: {
    id: 8453,
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    blockExplorer: "https://basescan.org"
  }
} as const
