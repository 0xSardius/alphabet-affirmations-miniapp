/**
 * Utility functions for name-first psychology in hybrid pricing model
 */

export interface Affirmation {
  letter: string
  word: string
}

export interface NameExtractionResult {
  nameLetters: Affirmation[]
  otherLetters: Affirmation[]
  readerSequence: Affirmation[]
}

/**
 * Extract letters that appear in the child's name from the full alphabet
 * @param childName The child's name
 * @param fullAlphabet Complete A-Z alphabet affirmations
 * @returns Object with name letters, other letters, and reading sequence
 */
export function extractNameLetters(
  childName: string, 
  fullAlphabet: Affirmation[]
): NameExtractionResult {
  // Get unique letters from child's name (case insensitive, letters only)
  const nameChars = [...new Set(
    childName.toLowerCase()
      .replace(/[^a-z]/g, '') // Remove non-letters
      .split('')
  )]
  
  // Find affirmations for name letters (preserve order of appearance in name)
  const nameLetters: Affirmation[] = []
  const usedLetters = new Set<string>()
  
  // Add letters in order they appear in the name (no duplicates)
  for (const char of nameChars) {
    if (!usedLetters.has(char)) {
      const affirmation = fullAlphabet.find(a => a.letter.toLowerCase() === char)
      if (affirmation) {
        nameLetters.push(affirmation)
        usedLetters.add(char)
      }
    }
  }
  
  // Get remaining letters (not in child's name)
  const otherLetters = fullAlphabet.filter(
    a => !nameChars.includes(a.letter.toLowerCase())
  )
  
  // Create reading sequence: name letters first, then alphabetical others
  const readerSequence = [...nameLetters, ...otherLetters]
  
  return {
    nameLetters,
    otherLetters,
    readerSequence
  }
}

/**
 * Get sample letters for teasing (4 non-name letters)
 * @param otherLetters Letters not in child's name
 * @returns Array of 4 sample letters for preview
 */
export function getSampleTeaserLetters(otherLetters: Affirmation[]): Affirmation[] {
  // Shuffle and take first 4 for variety
  const shuffled = [...otherLetters].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 4)
}

/**
 * Create reader sequence with name-first psychology
 * @param nameLetters Child's name letters
 * @param otherLetters Remaining alphabet letters
 * @returns Combined sequence for reading flow
 */
export function createReaderSequence(
  nameLetters: Affirmation[], 
  otherLetters: Affirmation[]
): Affirmation[] {
  return [...nameLetters, ...otherLetters]
}

/**
 * Check if user has finished reading all name letters
 * @param currentIndex Current position in reader sequence
 * @param nameLetterCount Number of letters in child's name
 * @returns True if user has read all name letters
 */
export function hasFinishedNameLetters(
  currentIndex: number, 
  nameLetterCount: number
): boolean {
  return currentIndex >= nameLetterCount
}
