/**
 * Word Bank for Alphabet Affirmations
 * Contains positive, child-friendly words for each letter A-Z
 * Used to generate personalized affirmations like "Quinn is Amazing"
 */

export interface WordBank {
  [letter: string]: string[]
}

export const AFFIRMATION_WORDS: WordBank = {
  A: [
    "Amazing", "Awesome", "Adventurous", "Artistic", "Affectionate", 
    "Ambitious", "Active", "Admirable", "Accomplished", "Adaptable", "Appreciated", "Able"
  ],
  B: [
    "Brave", "Beautiful", "Brilliant", "Bold", "Bubbly", 
    "Bright", "Beloved", "Balanced", "Boundless", "Blissful", "Blessed", "Brainy"
  ],
  C: [
    "Creative", "Caring", "Confident", "Curious", "Cheerful", 
    "Clever", "Compassionate", "Courageous", "Charming", "Capable", "Celebrated", "Calm", "a Champion"
  ],
  D: [
    "Determined", "Delightful", "Dedicated", "Daring", "Dynamic", 
    "Dependable", "Devoted", "Dignified", "Decisive", "Driven", "Deserving"
  ],
  E: [
    "Energetic", "Excellent", "Enthusiastic", "Exceptional", "Empathetic", 
    "Encouraging", "Elegant", "Extraordinary", "Expressive", "Endearing", "Empowered", "Enough", "Eager"
  ],
  F: [
    "Fantastic", "Friendly", "Fearless", "Fun", "Faithful", 
    "Fabulous", "Focused", "Funny", "Flexible", "Forgiving", "Fascinating", "Fierce", "Flawless", "Flourishing"
  ],
  G: [
    "Generous", "Gentle", "Gifted", "Graceful", "Great", 
    "Genuine", "Grateful", "Glorious", "Good", "Giggly", "Glowing", "Growing"
  ],
  H: [
    "Happy", "Helpful", "Honest", "Hopeful", "Heroic", 
    "Hardworking", "Harmonious", "Humble", "Healthy", "Hilarious", "Honored", "Honorable"
  ],
  I: [
    "Intelligent", "Imaginative", "Inspiring", "Independent", "Incredible", 
    "Innovative", "Insightful", "Impressive", "Intuitive", "Invincible", "Important"
  ],
  J: [
    "Joyful", "Just", "Jovial", "Jubilant", "Jolly", 
    "Jaunty", "Jazzy", "Jaunty", "Judicious"
  ],
  K: [
    "Kind", "Knowledgeable", "Keen", "Kindhearted", "Kooky", 
    "Knowing", "Keen-eyed", "Kingly"
  ],
  L: [
    "Loving", "Loyal", "Lively", "Lucky", "Logical", 
    "Luminous", "Likeable", "Lighthearted", "Limitless", "Legendary", "Loved"
  ],
  M: [
    "Magnificent", "Marvelous", "Motivated", "Magical", "Mindful", 
    "Memorable", "Mature", "Merry", "Mighty", "Miraculous", "Meaningful", "Masterful"
  ],
  N: [
    "Nice", "Noble", "Natural", "Nurturing", "Noteworthy", 
    "Nimble", "Neat", "Neighborly", "Needed", "Nifty"
  ],
  O: [
    "Outstanding", "Optimistic", "Original", "Organized", "Outgoing", 
    "Open", "Observant", "Obedient", "Open-minded", "Optimistic"
  ],
  P: [
    "Positive", "Precious", "Powerful", "Playful", "Patient", 
    "Passionate", "Persistent", "Peaceful", "Perfect", "Polite", "Proud", "Phenomenal"
  ],
  Q: [
    "Quick", "Quiet", "Quality", "Quirky", "Questioning", 
    "Qualified", "Quaint", "Queenly", "Quietly-confident", "Quick-thinking"
  ],
  R: [
    "Remarkable", "Respectful", "Responsible", "Radiant", "Resilient", 
    "Resourceful", "Reliable", "Refreshing", "Righteous", "Rockstar"
  ],
  S: [
    "Strong", "Smart", "Special", "Spectacular", "Supportive", 
    "Sincere", "Successful", "Sensitive", "Sparkling", "Stellar", "Shining", "Superb"
  ],
  T: [
    "Talented", "Thoughtful", "Trustworthy", "Tremendous", "Thriving", 
    "Thankful", "Tenacious", "Terrific", "Triumphant", "Treasured"
  ],
  U: [
    "Unique", "Understanding", "Uplifting", "Unstoppable", "Unbeatable", 
    "Upbeat", "Useful", "Unlimited", "Unshakeable", "Unconditional", "Unafraid", "Unforgettable"
  ],
  V: [
    "Valuable", "Vibrant", "Victorious",  "Virtuous", 
    "Visionary", "Versatile", "Vigorous", "Vital", "Vivid"
  ],
  W: [
    "Wonderful", "Wise", "Witty", "Warm", "Worthy", 
    "Wholesome", "Willing", "Winning", "Whimsical", "Wondrous", "Welcomed", "World-changing"
  ],
  X: [
    "eXtraordinary", "eXceptional", "eXcellent", "eXciting", "eXpressive", 
    "eXpansive", "eXquisite", "eXemplary", "eXuberant", "Xenial", "eXtra-special"
  ],
  Y: [
    "Young", "Youthful", "Yearning", "Yes-oriented", "Yielding", 
    "Yippee", "Young-hearted",
  ],
  Z: [
    "Zealous", "Zesty", "Zingy", "Zen", "Zinger", 
    "Zippy", "Zany", "Zooming", "Zestful", "Zingy"
  ]
}

/**
 * Get a random word for a specific letter
 * @param letter - The letter to get a word for (A-Z)
 * @returns A random positive word starting with that letter
 */
export function getRandomWordForLetter(letter: string): string {
  const upperLetter = letter.toUpperCase()
  const words = AFFIRMATION_WORDS[upperLetter]
  
  if (!words || words.length === 0) {
    return `${upperLetter}mazing` // Fallback
  }
  
  return words[Math.floor(Math.random() * words.length)]
}

/**
 * Get all words for a specific letter
 * @param letter - The letter to get words for (A-Z)
 * @returns Array of all positive words for that letter
 */
export function getWordsForLetter(letter: string): string[] {
  const upperLetter = letter.toUpperCase()
  return AFFIRMATION_WORDS[upperLetter] || []
}

/**
 * Get a specific word for a letter by index
 * @param letter - The letter to get a word for (A-Z)
 * @param index - The index of the word (0-based)
 * @returns The word at that index, or the first word if index is out of bounds
 */
export function getWordForLetterByIndex(letter: string, index: number): string {
  const words = getWordsForLetter(letter)
  if (words.length === 0) return `${letter.toUpperCase()}mazing`
  
  // Use modulo to wrap around if index is too large
  const safeIndex = index % words.length
  return words[safeIndex]
}

/**
 * Generate a complete alphabet with random words
 * @returns Object with A-Z letters and random words
 */
export function generateRandomAlphabet(): Record<string, string> {
  const alphabet: Record<string, string> = {}
  
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i) // A-Z
    alphabet[letter] = getRandomWordForLetter(letter)
  }
  
  return alphabet
}

/**
 * Generate a truly random alphabet (no seeding, completely random each time)
 * @returns Object with A-Z letters and completely random words
 */
export function generateTrulyRandomAlphabet(): Record<string, string> {
  const alphabet: Record<string, string> = {}
  
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i) // A-Z
    const wordsForLetter = getWordsForLetter(letter)
    // Use crypto.getRandomValues for true randomness if available
    let randomIndex: number
    
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint32Array(1)
      crypto.getRandomValues(array)
      randomIndex = array[0] % wordsForLetter.length
    } else {
      randomIndex = Math.floor(Math.random() * wordsForLetter.length)
    }
    
    alphabet[letter] = wordsForLetter[randomIndex]
  }
  
  return alphabet
}

/**
 * Improved seeded pseudo-random number generator
 * Uses a better algorithm for more variation between similar seeds
 */
function seededRandom(seed: number): () => number {
  let state = seed
  return function(): number {
    // Xorshift32 algorithm - better distribution than LCG
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    state = state >>> 0 // Convert to unsigned 32-bit
    return state / 4294967296
  }
}

/**
 * Generate a complete alphabet with specific word indices (for consistency)
 * @param seed - Seed for consistent but varied word selection
 * @returns Object with A-Z letters and consistent words
 */
export function generateConsistentAlphabet(seed: number = 0): Record<string, string> {
  const alphabet: Record<string, string> = {}
  const random = seededRandom(seed)
  
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i) // A-Z
    const wordsForLetter = getWordsForLetter(letter)
    const wordIndex = Math.floor(random() * wordsForLetter.length)
    alphabet[letter] = getWordForLetterByIndex(letter, wordIndex)
  }
  
  return alphabet
} 