/**
 * LocalStorage utilities for managing alphabet collections
 */

export interface Collection {
  id: string
  childName: string
  affirmations: { letter: string; word: string }[]
  letterCount: number
  mintDate: string
  thumbnailLetters: string[]
  userFid?: number
  createdAt: string
}

const STORAGE_KEY = 'alphabet-affirmations-collections'

/**
 * Load all collections from localStorage
 */
export function loadCollections(): Collection[] {
  try {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const collections: Collection[] = JSON.parse(stored)
    console.log('📂 Loaded collections from localStorage:', collections.length, 'items')
    return collections
  } catch (error) {
    console.error('❌ Error loading collections from localStorage:', error)
    return []
  }
}

/**
 * Save all collections to localStorage
 */
export function saveCollections(collections: Collection[]): void {
  try {
    if (typeof window === 'undefined') return
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections))
    console.log('💾 Saved collections to localStorage:', collections.length, 'items')
  } catch (error) {
    console.error('❌ Error saving collections to localStorage:', error)
  }
}

/**
 * Add a new collection
 */
export function addCollection(collection: Omit<Collection, 'id' | 'createdAt'>): Collection {
  const newCollection: Collection = {
    ...collection,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  
  const existing = loadCollections()
  const updated = [...existing, newCollection]
  saveCollections(updated)
  
  console.log('✅ Added new collection:', newCollection.childName)
  return newCollection
}

/**
 * Remove a collection by ID
 */
export function removeCollection(id: string): void {
  const existing = loadCollections()
  const updated = existing.filter(collection => collection.id !== id)
  saveCollections(updated)
  
  console.log('🗑️ Removed collection:', id)
}

/**
 * Create a collection from generated affirmations
 */
export function createCollectionFromAffirmations(
  childName: string,
  affirmations: { letter: string; word: string }[],
  userFid?: number,
  tier: "random" | "custom" = "random"
): Collection {
  const now = new Date()
  const mintDate = now.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
  
  // Count existing collections for this child to create unique naming
  const existing = loadCollections()
  const childCollections = existing.filter(c => c.childName.toLowerCase() === childName.toLowerCase())
  const tierCollections = childCollections.filter(c => c.id.includes(tier))
  const tierCount = tierCollections.length + 1
  
  // Create descriptive collection name
  const collectionSuffix = tier === "random" 
    ? tierCount === 1 ? "" : ` #${tierCount}` // "Emma" or "Emma #2"
    : " (Custom)" // "Emma (Custom)"
  
  return addCollection({
    childName: childName + collectionSuffix,
    affirmations,
    letterCount: affirmations.length,
    mintDate,
    thumbnailLetters: affirmations.slice(0, 4).map(a => a.letter),
    userFid,
  })
}

/**
 * Clear all collections (for testing/debugging)
 */
export function clearAllCollections(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('🧹 Cleared all collections')
  } catch (error) {
    console.error('❌ Error clearing collections:', error)
  }
} 