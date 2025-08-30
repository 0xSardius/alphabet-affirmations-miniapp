import { readContract } from 'wagmi/actions'
import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { CONTRACTS } from './constants/contracts'
import { AlphabetAffirmationsNFTV2ABI } from './contracts/AlphabetAffirmationsNFTV2.abi'

// Create a simple config for contract reads
const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
})

export interface NFTCollection {
  id: string
  tokenId: number
  childName: string
  affirmations: { letter: string; word: string }[]
  mintDate: string
  letterCount: number
  thumbnailLetters: { letter: string; word: string }[]
  tier: "random" | "custom"
  hasCustomizations: boolean
  minter: string
}

/**
 * Fetch all NFTs owned by a user
 */
export async function getUserNFTCollections(userAddress: string): Promise<NFTCollection[]> {
  try {
    console.log('🔍 Fetching NFTs for address:', userAddress)
    
    // Get all token IDs owned by the user
    const tokenIds = await readContract(config, {
      address: CONTRACTS.ALPHABET_NFT_V2.address,
      abi: AlphabetAffirmationsNFTV2ABI,
      functionName: 'tokensOfOwner',
      args: [userAddress as `0x${string}`],
    })

    console.log('📝 Found token IDs:', tokenIds)

    if (!tokenIds || tokenIds.length === 0) {
      return []
    }

    // Fetch data for each token
    const collections: NFTCollection[] = []
    
    for (const tokenId of tokenIds) {
      try {
        const alphabetData = await readContract(config, {
          address: CONTRACTS.ALPHABET_NFT_V2.address,
          abi: AlphabetAffirmationsNFTV2ABI,
          functionName: 'getAlphabetData',
          args: [tokenId],
        })

        // Convert contract data to our format
        const collection: NFTCollection = {
          id: `nft-${tokenId}`,
          tokenId: Number(tokenId),
          childName: alphabetData.childName,
          affirmations: alphabetData.words.map((word: string, index: number) => ({
            letter: String.fromCharCode(65 + index), // A, B, C...
            word: word
          })),
          mintDate: new Date(Number(alphabetData.timestamp) * 1000).toLocaleDateString(),
          letterCount: 26,
          thumbnailLetters: alphabetData.words.slice(0, 4).map((word: string, index: number) => ({
            letter: String.fromCharCode(65 + index),
            word: word
          })),
          tier: alphabetData.tier === 0 ? "random" : "custom",
          hasCustomizations: alphabetData.hasCustomizations,
          minter: alphabetData.minter
        }

        collections.push(collection)
        console.log('✅ Loaded NFT collection:', collection.childName, `(Token #${tokenId})`)
        
      } catch (error) {
        console.error(`❌ Failed to load data for token ${tokenId}:`, error)
      }
    }

    console.log('🎉 Successfully loaded', collections.length, 'NFT collections')
    return collections

  } catch (error) {
    console.error('❌ Failed to fetch user NFTs:', error)
    return []
  }
}

/**
 * Get a specific NFT by token ID
 */
export async function getNFTCollection(tokenId: number): Promise<NFTCollection | null> {
  try {
    const alphabetData = await readContract(config, {
      address: CONTRACTS.ALPHABET_NFT_V2.address,
      abi: AlphabetAffirmationsNFTV2ABI,
      functionName: 'getAlphabetData',
      args: [BigInt(tokenId)],
    })

    return {
      id: `nft-${tokenId}`,
      tokenId: tokenId,
      childName: alphabetData.childName,
      affirmations: alphabetData.words.map((word: string, index: number) => ({
        letter: String.fromCharCode(65 + index),
        word: word
      })),
      mintDate: new Date(Number(alphabetData.timestamp) * 1000).toLocaleDateString(),
      letterCount: 26,
      thumbnailLetters: alphabetData.words.slice(0, 4).map((word: string, index: number) => ({
        letter: String.fromCharCode(65 + index),
        word: word
      })),
      tier: alphabetData.tier === 0 ? "random" : "custom",
      hasCustomizations: alphabetData.hasCustomizations,
      minter: alphabetData.minter
    }

  } catch (error) {
    console.error(`❌ Failed to fetch NFT ${tokenId}:`, error)
    return null
  }
}
