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
    "Ambitious", "Active", "Admirable", "Accomplished", "Adaptable"
  ],
  B: [
    "Brave", "Beautiful", "Brilliant", "Bold", "Bubbly", 
    "Bright", "Beloved", "Balanced", "Boundless", "Blissful"
  ],
  C: [
    "Creative", "Caring", "Confident", "Curious", "Cheerful", 
    "Clever", "Compassionate", "Courageous", "Charming", "Capable"
  ],
  D: [
    "Determined", "Delightful", "Dedicated", "Daring", "Dynamic", 
    "Dependable", "Devoted", "Dignified", "Decisive", "Driven"
  ],
  E: [
    "Energetic", "Excellent", "Enthusiastic", "Exceptional", "Empathetic", 
    "Encouraging", "Elegant", "Extraordinary", "Expressive", "Endearing"
  ],
  F: [
    "Fantastic", "Friendly", "Fearless", "Fun", "Faithful", 
    "Fabulous", "Focused", "Funny", "Flexible", "Forgiving"
  ],
  G: [
    "Generous", "Gentle", "Gifted", "Graceful", "Great", 
    "Genuine", "Grateful", "Glorious", "Good", "Giggly"
  ],
  H: [
    "Happy", "Helpful", "Honest", "Hopeful", "Heroic", 
    "Hardworking", "Harmonious", "Humble", "Healthy", "Hilarious"
  ],
  I: [
    "Intelligent", "Imaginative", "Inspiring", "Independent", "Incredible", 
    "Innovative", "Insightful", "Impressive", "Intuitive", "Invincible"
  ],
  J: [
    "Joyful", "Just", "Jovial", "Jubilant", "Jolly", 
    "Gentle", "Generous", "Genuine", "Gracious", "Jaunty"
  ],
  K: [
    "Kind", "Knowledgeable", "Keen", "Kindhearted", "Kooky", 
    "Knowing", "Kaleidoscopic", "Kingly"
  ],
  L: [
    "Loving", "Loyal", "Lively", "Lucky", "Logical", 
    "Luminous", "Likeable", "Lighthearted", "Limitless", "Legendary"
  ],
  M: [
    "Magnificent", "Marvelous", "Motivated", "Magical", "Mindful", 
    "Memorable", "Mature", "Merry", "Mighty", "Miraculous"
  ],
  N: [
    "Nice", "Noble", "Natural", "Nurturing", "Noteworthy", 
    "Nimble", "Neat", "Neighborly", "Needed", "Nifty"
  ],
  O: [
    "Outstanding", "Optimistic", "Original", "Organized", "Outgoing", 
    "Open", "Observant", "Obedient", "Oceanic", "Outstanding"
  ],
  P: [
    "Positive", "Precious", "Powerful", "Playful", "Patient", 
    "Passionate", "Persistent", "Peaceful", "Perfect", "Polite"
  ],
  Q: [
    "Quick", "Quiet", "Quality", "Quirky", "Questioning", 
    "Qualified", "Quaint", "Queenly", "Quotable", "Quixotic"
  ],
  R: [
    "Remarkable", "Respectful", "Responsible", "Radiant", "Resilient", 
    "Resourceful", "Reliable", "Refreshing", "Righteous", "Rockstar"
  ],
  S: [
    "Strong", "Smart", "Special", "Spectacular", "Supportive", 
    "Sincere", "Successful", "Sensitive", "Sparkling", "Stellar"
  ],
  T: [
    "Talented", "Thoughtful", "Trustworthy", "Tremendous", "Thriving", 
    "Thankful", "Tenacious", "Tremendous", "Triumphant", "Treasured"
  ],
  U: [
    "Unique", "Understanding", "Uplifting", "Unstoppable", "Unbeatable", 
    "Upbeat", "Useful", "Unlimited", "Unshakeable", "Unconditional"
  ],
  V: [
    "Valuable", "Vibrant", "Victorious", "Vivacious", "Virtuous", 
    "Visionary", "Versatile", "Vigorous", "Vital", "Vivid"
  ],
  W: [
    "Wonderful", "Wise", "Witty", "Warm", "Worthy", 
    "Wholesome", "Willing", "Winning", "Whimsical", "Wondrous"
  ],
  X: [
    "eXtraordinary", "eXceptional", "eXcellent", "eXciting", "eXpressive", 
    "eXpansive", "eXquisite", "eXemplary", "eXuberant", "Xenial"
  ],
  Y: [
    "Young", "Youthful", "Yearning", "Yes-oriented", "Yielding", 
    "Yummy", "Yippee", "Yonder", "Yearlong", "Yesterday's-hero"
  ],
  Z: [
    "Zealous", "Zesty", "Zingy", "Zen", "Zinger", 
    "Zippy", "Zany", "Zooming", "Zestful", "Zeal-filled"
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
 * Generate a complete alphabet with specific word indices (for consistency)
 * @param seed - Optional seed for consistent word selection
 * @returns Object with A-Z letters and consistent words
 */
export function generateConsistentAlphabet(seed: number = 0): Record<string, string> {
  const alphabet: Record<string, string> = {}
  
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i) // A-Z
    const wordIndex = (seed + i) % getWordsForLetter(letter).length
    alphabet[letter] = getWordForLetterByIndex(letter, wordIndex)
  }
  
  return alphabet
} 