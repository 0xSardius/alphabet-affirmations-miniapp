"use client"

import { useState } from "react"
import { Input } from "./input"
import { Button } from "./button"
import { PartialPreview } from "./partial-preview"
import { PreviewSkeleton } from "./preview-skeleton"
import { MintingDialog } from "./minting-dialog"
import { Header } from "./header"
import { generateRandomAlphabet, generateConsistentAlphabet, getRandomWordForLetter } from "../../lib/data/word-bank"

type Affirmation = {
  letter: string
  word: string
}

type GeneratorState = "input" | "generating" | "preview"

export function AlphabetGenerator() {
  const [childName, setChildName] = useState("")
  const [state, setState] = useState<GeneratorState>("input")
  const [affirmations, setAffirmations] = useState<Affirmation[]>([])
  const [showMintingDialog, setShowMintingDialog] = useState(false)

  // Name validation function
  const validateName = (name: string): { isValid: boolean; error?: string } => {
    const trimmedName = name.trim()
    
    if (!trimmedName) {
      return { isValid: false, error: "Name is required" }
    }
    
    if (trimmedName.length < 2) {
      return { isValid: false, error: "Name must be at least 2 characters" }
    }
    
    if (trimmedName.length > 20) {
      return { isValid: false, error: "Name must be 20 characters or less" }
    }
    
    // Check for letters only (allow spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s\-\']+$/
    if (!nameRegex.test(trimmedName)) {
      return { isValid: false, error: "Name can only contain letters, spaces, hyphens, and apostrophes" }
    }
    
    return { isValid: true }
  }

  const handleGenerate = async () => {
    const validation = validateName(childName)
    if (!validation.isValid) {
      // In a real app, you'd show this error to the user
      console.error("Name validation failed:", validation.error)
      return
    }

    setState("generating")

    // Simulate AI generation delay (realistic timing)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate consistent alphabet using child's name as seed
    // Convert name to number seed for consistent generation
    const nameToSeed = (name: string): number => {
      let hash = 0
      for (let i = 0; i < name.length; i++) {
        const char = name.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
      }
      return Math.abs(hash)
    }
    
    const generatedWords = generateConsistentAlphabet(nameToSeed(childName.trim()))
    
    // Convert to affirmations format
    const newAffirmations: Affirmation[] = Object.entries(generatedWords).map(([letter, word]) => ({
      letter,
      word
    }))

    setAffirmations(newAffirmations)
    setState("preview")
  }

  const handleMint = () => {
    setShowMintingDialog(true)
  }

  const handleMintingComplete = async () => {
    // Simulate minting process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setShowMintingDialog(false)
    // Could redirect to full alphabet view or success page here
    console.log("Minting completed for:", childName)
  }

  const handleCustomize = () => {
    console.log("Customizing words for:", childName)
    // Handle customization logic - could open a word selection interface
  }

  // Word regeneration functionality
  const regenerateWord = (letter: string) => {
    const newWord = getRandomWordForLetter(letter)
    setAffirmations(prev => 
      prev.map(affirmation => 
        affirmation.letter === letter 
          ? { ...affirmation, word: newWord }
          : affirmation
      )
    )
  }

  const regenerateAllWords = () => {
    const newWords = generateRandomAlphabet()
    const newAffirmations: Affirmation[] = Object.entries(newWords).map(([letter, word]) => ({
      letter,
      word
    }))
    setAffirmations(newAffirmations)
  }

  const handleBack = () => {
    setState("input")
    setChildName("")
    setAffirmations([])
  }

  // Get validation for current name
  const nameValidation = validateName(childName)

  if (state === "input") {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header title="Create Alphabet" />
        <div className="px-6 py-8 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-serif text-white">Create Personalized Alphabet</h1>
              <p className="text-gray-400 font-sans">
                Enter your child{"'"}s name to generate their unique alphabet affirmations
              </p>
            </div>

            <div className="space-y-6">
              <Input
                label="Child's Name"
                placeholder="Enter name..."
                value={childName}
                onChange={setChildName}
                maxLength={20}
                error={!nameValidation.isValid ? nameValidation.error : undefined}
              />

              <Button
                variant="primary"
                size="lg"
                onClick={handleGenerate}
                disabled={!nameValidation.isValid}
                className="w-full"
              >
                Generate Preview
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (state === "generating") {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header title="Generating..." showBack onBack={handleBack} />
        <div className="px-6 py-8">
          <PreviewSkeleton childName={childName} />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-black text-white">
        <Header title="Preview" showBack onBack={handleBack} />
        <div className="px-6 py-8">
          <PartialPreview
            childName={childName}
            affirmations={affirmations}
            onMint={handleMint}
            onCustomize={handleCustomize}
          />
        </div>
      </div>

      {/* Minting Dialog */}
      <MintingDialog
        childName={childName}
        isOpen={showMintingDialog}
        onClose={() => setShowMintingDialog(false)}
        onMint={handleMintingComplete}
      />
    </>
  )
}
