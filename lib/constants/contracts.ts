// Contract addresses and configuration
export const CONTRACTS = {
  ALPHABET_NFT_V2: {
    address: "0x8313189F789d7e901636EE50932a98D50Faa4a6B" as const,
    chainId: 84532, // Base Sepolia
    name: "AlphabetAffirmationsNFTV2"
  }
} as const

// Pricing in ETH (Base Sepolia)
export const PRICING = {
  RANDOM_TIER: "0.0003", // $0.99 equivalent 
  CUSTOM_TIER: "0.0015"  // $5.00 equivalent
} as const

// Chain configuration
export const CHAINS = {
  BASE_SEPOLIA: {
    id: 84532,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org"
  }
} as const
