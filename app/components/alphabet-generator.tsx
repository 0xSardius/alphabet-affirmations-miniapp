"use client"

import { useState } from "react"
import { Input } from "./input"
import { Button } from "./button"
import { PartialPreview } from "./partial-preview"
import { PreviewSkeleton } from "./preview-skeleton"
import { MintingDialog } from "./minting-dialog"
import { Header } from "./header"

// Sample affirmation words for demonstration
const sampleAffirmations = [
  { letter: "A", word: "Amazing" },
  { letter: "B", word: "Brave" },
  { letter: "C", word: "Creative" },
  { letter: "D", word: "Determined" },
  { letter: "E", word: "Excellent" },
  { letter: "F", word: "Fantastic" },
  { letter: "G", word: "Generous" },
  { letter: "H", word: "Happy" },
  { letter: "I", word: "Intelligent" },
  { letter: "J", word: "Joyful" },
  { letter: "K", word: "Kind" },
  { letter: "L", word: "Loving" },
  { letter: "M", word: "Magnificent" },
  { letter: "N", word: "Nice" },
  { letter: "O", word: "Outstanding" },
  { letter: "P", word: "Positive" },
  { letter: "Q", word: "Quick" },
  { letter: "R", word: "Remarkable" },
  { letter: "S", word: "Strong" },
  { letter: "T", word: "Talented" },
  { letter: "U", word: "Unique" },
  { letter: "V", word: "Valuable" },
  { letter: "W", word: "Wonderful" },
  { letter: "X", word: "eXtraordinary" },
  { letter: "Y", word: "Young" },
  { letter: "Z", word: "Zealous" },
]

type GeneratorState = "input" | "generating" | "preview"

export function AlphabetGenerator() {
  const [childName, setChildName] = useState("")
  const [state, setState] = useState<GeneratorState>("input")
  const [affirmations, setAffirmations] = useState(sampleAffirmations)
  const [showMintingDialog, setShowMintingDialog] = useState(false)

  const handleGenerate = async () => {
    if (!childName.trim()) return

    setState("generating")

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 3000))

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

  const handleBack = () => {
    setState("input")
    setChildName("")
  }

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
              />

              <Button
                variant="primary"
                size="lg"
                onClick={handleGenerate}
                disabled={!childName.trim()}
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
