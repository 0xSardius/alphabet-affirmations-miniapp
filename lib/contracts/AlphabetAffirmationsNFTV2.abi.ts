export const AlphabetAffirmationsNFTV2ABI = [
  {
    "inputs": [
      {"name": "childName", "type": "string"},
      {"name": "words", "type": "string[26]"},
      {"name": "metadataURI", "type": "string"},
      {"name": "tier", "type": "uint8"},
      {"name": "customizedLetters", "type": "string[]"},
      {"name": "nameLetters", "type": "string"}
    ],
    "name": "mintAlphabet",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "RANDOM_PRICE",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "CUSTOM_PRICE", 
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const
