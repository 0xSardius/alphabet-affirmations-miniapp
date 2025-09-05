"use client"

import { useState } from "react"
import { Button } from "./button"
import { Card } from "./card"
import { Header } from "./header"
import { cn } from "@/lib/utils"

interface Affirmation {
  letter: string
  word: string
}

interface WordCustomizerProps {
  childName: string
  affirmations: Affirmation[]
  onSave: (customizedAffirmations: Affirmation[]) => void
  onBack?: () => void
  className?: string
}

interface WordSelectionModalProps {
  letter: string
  currentWord: string
  childName: string
  isOpen: boolean
  onSelect: (word: string) => void
  onClose: () => void
}

// Sample alternative words for each letter (in production, this would come from your word bank)
const getAlternativeWords = (letter: string): string[] => {
  const alternatives: Record<string, string[]> = {
    'A': ['Amazing', 'Awesome', 'Adventurous', 'Artistic', 'Ambitious', 'Affectionate'],
    'B': ['Brave', 'Brilliant', 'Beautiful', 'Bold', 'Bright', 'Beloved'],
    'C': ['Creative', 'Confident', 'Caring', 'Cheerful', 'Curious', 'Clever'],
    'D': ['Determined', 'Delightful', 'Dynamic', 'Daring', 'Dependable', 'Devoted'],
    'E': ['Energetic', 'Extraordinary', 'Empathetic', 'Enthusiastic', 'Elegant', 'Exceptional'],
    'F': ['Friendly', 'Fearless', 'Fantastic', 'Funny', 'Faithful', 'Fabulous'],
    'G': ['Generous', 'Gentle', 'Graceful', 'Genuine', 'Gifted', 'Great'],
    'H': ['Happy', 'Honest', 'Helpful', 'Hopeful', 'Humble', 'Heroic'],
    'I': ['Intelligent', 'Independent', 'Inspiring', 'Imaginative', 'Incredible', 'Innovative'],
    'J': ['Joyful', 'Just', 'Jolly', 'Jubilant', 'Judicious', 'Jovial'],
    'K': ['Kind', 'Knowledgeable', 'Keen', 'Kindhearted', 'Kooky', 'Kissable'],
    'L': ['Loving', 'Loyal', 'Lucky', 'Lively', 'Likeable', 'Lighthearted'],
    'M': ['Magnificent', 'Marvelous', 'Magical', 'Motivated', 'Mindful', 'Mighty'],
    'N': ['Nice', 'Noble', 'Natural', 'Nurturing', 'Notable', 'Neat'],
    'O': ['Outstanding', 'Optimistic', 'Original', 'Open-minded', 'Organized', 'Outgoing'],
    'P': ['Positive', 'Peaceful', 'Playful', 'Patient', 'Precious', 'Powerful'],
    'Q': ['Quick', 'Quiet', 'Quality', 'Quirky', 'Qualified', 'Queenly'],
    'R': ['Remarkable', 'Responsible', 'Radiant', 'Resilient', 'Respectful', 'Reliable'],
    'S': ['Strong', 'Smart', 'Special', 'Sincere', 'Spirited', 'Spectacular'],
    'T': ['Talented', 'Thoughtful', 'Trustworthy', 'Tenacious', 'Terrific', 'Tender'],
    'U': ['Unique', 'Understanding', 'Uplifting', 'Unselfish', 'Unstoppable', 'Upbeat'],
    'V': ['Valuable', 'Vibrant', 'Victorious', 'Vivacious', 'Virtuous', 'Visionary'],
    'W': ['Wonderful', 'Wise', 'Witty', 'Warm', 'Worthy', 'Wholesome'],
    'X': ['eXtraordinary', 'eXcellent', 'eXciting', 'eXpressive', 'eXceptional', 'eXuberant'],
    'Y': ['Young', 'Youthful', 'Yearning', 'Yes-person', 'Yielding', 'Yummy'],
    'Z': ['Zealous', 'Zestful', 'Zippy', 'Zen', 'Zany', 'Zingy']
  }
  
  return alternatives[letter.toUpperCase()] || ['Amazing', 'Brilliant', 'Creative']
}

function WordSelectionModal({ 
  letter, 
  currentWord, 
  childName, 
  isOpen, 
  onSelect, 
  onClose 
}: WordSelectionModalProps) {
  const [customWord, setCustomWord] = useState('')
  const alternatives = getAlternativeWords(letter)

  if (!isOpen) return null

  const handleCustomSubmit = () => {
    if (customWord.trim() && customWord.trim() !== currentWord) {
      onSelect(customWord.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <Card className="max-w-sm w-full space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-serif font-bold text-white">
            Choose {letter.toUpperCase()} Word for {childName}
          </h3>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-300 font-sans">
            Current: <span className="text-white font-semibold">{currentWord}</span>
          </p>

          <div>
            <p className="text-sm text-gray-400 font-sans mb-2">Popular alternatives:</p>
            <div className="grid grid-cols-2 gap-2">
              {alternatives.map((word) => (
                <Button
                  key={word}
                  variant={word === currentWord ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => onSelect(word)}
                  className="text-sm"
                  disabled={word === currentWord}
                >
                  {word}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 font-sans mb-2">Or type your own:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customWord}
                onChange={(e) => setCustomWord(e.target.value)}
                placeholder="Enter custom word..."
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                maxLength={20}
              />
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleCustomSubmit}
                disabled={!customWord.trim() || customWord.trim() === currentWord}
              >
                Use
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  )
}

export function WordCustomizer({ 
  childName, 
  affirmations, 
  onSave, 
  onBack, 
  className 
}: WordCustomizerProps) {
  const [customizedAffirmations, setCustomizedAffirmations] = useState<Affirmation[]>(affirmations)
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [changeCount, setChangeCount] = useState(0)

  const handleWordChange = (letter: string, newWord: string) => {
    setCustomizedAffirmations(prev => 
      prev.map(affirmation => 
        affirmation.letter === letter 
          ? { ...affirmation, word: newWord }
          : affirmation
      )
    )
    setChangeCount(prev => prev + 1)
    setSelectedLetter(null)
  }

  const hasChanges = changeCount > 0

  return (
    <div className={cn("fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4", className)}>
      <Card className="max-w-md w-full space-y-6 max-h-[80vh] overflow-y-auto">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-serif font-bold text-white">
            Make {childName}'s Alphabet Perfect
          </h1>
          <p className="text-sm text-gray-400 font-sans">
            Tap any word to change it
          </p>
        </div>

        {/* Affirmations List */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {customizedAffirmations.map((affirmation) => (
            <div 
              key={affirmation.letter}
              className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() => setSelectedLetter(affirmation.letter)}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-white font-sans">
                  {affirmation.letter.toUpperCase()}
                </span>
                <span className="text-white font-serif">
                  {affirmation.word}
                </span>
              </div>
              <Button variant="ghost" size="sm" className="text-xs">
                ✏️ Change
              </Button>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
          <p className="text-sm text-blue-300 font-sans">
            💡 Tip: Most parents change 2-3 words to feel perfect
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            variant="primary" 
            size="lg" 
            onClick={() => onSave(customizedAffirmations)}
            className="w-full"
          >
            {hasChanges ? `Save Changes (${changeCount} modified)` : 'Mint - $5'}
          </Button>
          
          <Button 
            variant="ghost" 
            size="md" 
            onClick={onBack}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </Card>

      {/* Word Selection Modal */}
      <WordSelectionModal
        letter={selectedLetter || ''}
        currentWord={customizedAffirmations.find(a => a.letter === selectedLetter)?.word || ''}
        childName={childName}
        isOpen={!!selectedLetter}
        onSelect={(word) => selectedLetter && handleWordChange(selectedLetter, word)}
        onClose={() => setSelectedLetter(null)}
      />
    </div>
  )
}
