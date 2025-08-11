"use client"

import { useState } from "react"
import { useMiniKit } from "@coinbase/onchainkit/minikit"
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

interface AlphabetGeneratorProps {
  onComplete?: (affirmations: Affirmation[], name: string) => void
  initialChildName?: string
}

export function AlphabetGenerator({ onComplete, initialChildName }: AlphabetGeneratorProps) {
  const { context } = useMiniKit()
  const [childName, setChildName] = useState(initialChildName || "")
  const [state, setState] = useState<GeneratorState>("input")
  const [affirmations, setAffirmations] = useState<Affirmation[]>([])
  const [showMintingDialog, setShowMintingDialog] = useState(false)
  const [rerollCount, setRerollCount] = useState(0)

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

  // Generate personalized seed using child name + parent's FID + reroll count
  const generatePersonalizedSeed = (childName: string, parentFid: number, rerollCount: number = 0): number => {
    const combined = `${childName.toLowerCase()}-${parentFid}-${rerollCount}`
    let hash = 0
    
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return Math.abs(hash)
  }

  // Fallback seed for development/testing (using session-based approach)
  const getFallbackSeed = (childName: string, rerollCount: number = 0): number => {
    // Get or create a session identifier
    let sessionId = sessionStorage.getItem('alphabet_session_id')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      sessionStorage.setItem('alphabet_session_id', sessionId)
    }
    
    const combined = `${childName.toLowerCase()}-${sessionId}-${rerollCount}`
    let hash = 0
    
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    
    return Math.abs(hash)
  }

  // Persisted reroll counter per name and user (survives component remounts)
  const getAndIncrementRerollCounter = (childName: string, fid?: number): number => {
    const key = `alphabet_rr_${fid ?? 'anon'}_${childName.toLowerCase()}`
    const current = parseInt(sessionStorage.getItem(key) || '0', 10)
    sessionStorage.setItem(key, String(current + 1))
    return current
  }

  const handleGenerate = async () => {
    const validation = validateName(childName)
    if (!validation.isValid) {
      console.error("Name validation failed:", validation.error)
      return
    }

    setState("generating")

    // Generate personalized seed
    const trimmedName = childName.trim()
    let seed: number

    // Ensure rerolls change even after component remounts
    const persistentReroll = getAndIncrementRerollCounter(trimmedName, context?.user?.fid)
    const effectiveReroll = rerollCount > 0 ? rerollCount : persistentReroll
    
    if (context?.user?.fid) {
      // Use parent's FID for personalized but consistent generation
      seed = generatePersonalizedSeed(trimmedName, context.user.fid, effectiveReroll)
      console.log(`Generated personalized alphabet for ${trimmedName} (Parent FID: ${context.user.fid}, Reroll: ${effectiveReroll})`)
    } else {
      // Fallback for development/testing
      seed = getFallbackSeed(trimmedName, effectiveReroll)
      console.log(`Generated alphabet for ${trimmedName} (Development mode, Reroll: ${effectiveReroll})`)
    }
    
    const generatedWords = generateConsistentAlphabet(seed)
    
    // Convert to affirmations format
    const newAffirmations: Affirmation[] = Object.entries(generatedWords).map(([letter, word]) => ({
      letter,
      word
    }))

    setAffirmations(newAffirmations)
    
    // Skip the blurred preview paywall and go directly to full alphabet
    if (onComplete) {
      onComplete(newAffirmations, trimmedName)
    } else {
      setState("preview")
    }
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
    
    // Call onComplete callback to notify parent component
    if (onComplete) {
      onComplete(affirmations, childName)
    }
  }

  const handleCustomize = () => {
    console.log("Customizing words for:", childName)
    // Handle customization logic - could open a word selection interface
  }

  const handleReroll = async () => {
    setState("generating")
    setRerollCount(prev => prev + 1)
    
    // Generate new alphabet with updated reroll count
    const trimmedName = childName.trim()
    let seed: number

    // Use persistent reroll counter to ensure a new seed every click
    const newRerollCount = getAndIncrementRerollCounter(trimmedName, context?.user?.fid)
    
    if (context?.user?.fid) {
      seed = generatePersonalizedSeed(trimmedName, context.user.fid, newRerollCount)
      console.log(`Rerolled alphabet for ${trimmedName} (Reroll: ${newRerollCount})`)
    } else {
      seed = getFallbackSeed(trimmedName, newRerollCount)
      console.log(`Rerolled alphabet for ${trimmedName} (Development mode, Reroll: ${newRerollCount})`)
    }
    
    const generatedWords = generateConsistentAlphabet(seed)
    const newAffirmations: Affirmation[] = Object.entries(generatedWords).map(([letter, word]) => ({
      letter,
      word
    }))

    setAffirmations(newAffirmations)
    
    // Skip the blurred preview paywall and go directly to full alphabet
    if (onComplete) {
      onComplete(newAffirmations, trimmedName)
    } else {
      setState("preview")
    }
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
    setRerollCount(0) // Reset reroll count when starting fresh
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
              {context?.user?.username && (
                <p className="text-sm text-gray-500 font-sans">
                  Creating for @{context.user.username}{"'"}s family
                </p>
              )}
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
                Create My Alphabet
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (state === "generating") {
    const title = rerollCount > 0 ? "Generating New Set..." : "Generating..."
    return (
      <div className="min-h-screen bg-black text-white">
        <Header title={title} showBack onBack={handleBack} />
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
            onReroll={handleReroll}
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
