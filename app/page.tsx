"use client"

import { useState, useEffect } from "react"
import { useMiniKit } from "@coinbase/onchainkit/minikit"
import { HomeView } from "./components/home-view"
import { LibraryView } from "./components/library-view"
import { ReaderPage } from "./components/reader-page"
import { AffirmationCard } from "./components/affirmation-card"
import { Input } from "./components/input"
import { Button } from "./components/button"
import { Card } from "./components/card"
import { Header } from "./components/header"
import { ShareButton } from "./components/share-button"
import { AddMiniAppBanner } from "./components/add-miniapp-banner"
import { MintingDialog } from "./components/minting-dialog"
import { AuthFallback } from "./components/auth-fallback"
import { AlphabetGenerator } from "./components/alphabet-generator"

// Sample affirmation words for fallback (when no generated alphabet exists)
const affirmationWords = {
  A: "Amazing",
  B: "Brave",
  C: "Creative",
  D: "Determined",
  E: "Energetic",
  F: "Friendly",
  G: "Generous",
  H: "Happy",
  I: "Intelligent",
  J: "Joyful",
  K: "Kind",
  L: "Loving",
  M: "Magnificent",
  N: "Nice",
  O: "Outstanding",
  P: "Positive",
  Q: "Quick",
  R: "Remarkable",
  S: "Strong",
  T: "Talented",
  U: "Unique",
  V: "Valuable",
  W: "Wonderful",
  X: "eXtraordinary",
  Y: "Young",
  Z: "Zealous",
}

type View = "home" | "create" | "library" | "reader" | "alphabet" | "generator"

type GeneratedAffirmation = {
  letter: string
  word: string
}

export default function AlphabetAffirmations() {
  const { setFrameReady, isFrameReady } = useMiniKit()
  const [currentView, setCurrentView] = useState<View>("home")
  const [childName, setChildName] = useState("")
  const [currentLetter, setCurrentLetter] = useState(0)
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [isMiniAppAdded, setIsMiniAppAdded] = useState(false)
  const [showAddBanner, setShowAddBanner] = useState(true)
  const [showMintingDialog, setShowMintingDialog] = useState(false)
  const [showAuthFallback, setShowAuthFallback] = useState(false)
  
  // Generated affirmations from AlphabetGenerator
  const [generatedAffirmations, setGeneratedAffirmations] = useState<GeneratedAffirmation[]>([])

  // Initialize MiniKit when component mounts
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady()
    }
  }, [isFrameReady, setFrameReady])

  // Farcaster profile state
  const [farcasterProfile] = useState({
    username: "sarah",
    avatarUrl: "/placeholder.svg?height=24&width=24",
    isConnected: true,
    isLoading: false,
  })

  // Sample collections data
  const [collections] = useState([
    {
      id: "1",
      childName: "Emma",
      letterCount: 26,
      mintDate: "Jan 15",
      thumbnailLetters: ["A", "B", "C", "D"],
    },
    {
      id: "2",
      childName: "Liam",
      letterCount: 26,
      mintDate: "Jan 10",
      thumbnailLetters: ["A", "B", "C", "D"],
    },
  ])

  // Use generated affirmations if available, otherwise fall back to sample data
  const currentAffirmations = generatedAffirmations.length > 0 ? generatedAffirmations : 
    Object.entries(affirmationWords).map(([letter, word]) => ({ letter, word }))

  const currentLetterData = currentAffirmations[currentLetter]

  const handleCreateNew = () => {
    setCurrentView("generator")
    setChildName("")
    setGeneratedAffirmations([]) // Clear any existing generated affirmations
  }

  const handleNameSubmit = () => {
    if (childName.trim()) {
      setShowMintingDialog(true)
    }
  }

  const handleMint = async () => {
    // Simulate minting process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setShowMintingDialog(false)
    setCurrentView("alphabet")
  }

  const handleStartReading = () => {
    setCurrentLetter(0)
    setCurrentView("reader")
  }

  const handleNext = () => {
    if (currentLetter < currentAffirmations.length - 1) {
      setCurrentLetter(currentLetter + 1)
    }
  }

  const handlePrevious = () => {
    if (currentLetter > 0) {
      setCurrentLetter(currentLetter - 1)
    }
  }

  const handleSelectCollection = (id: string) => {
    setSelectedCollection(id)
    const collection = collections.find((c) => c.id === id)
    if (collection) {
      setChildName(collection.childName)
      setCurrentView("alphabet")
    }
  }

  // Handler for when alphabet generation is complete
  const handleAlphabetGenerated = (affirmations: GeneratedAffirmation[], name: string) => {
    setGeneratedAffirmations(affirmations)
    setChildName(name)
    setCurrentView("alphabet")
  }

  if (currentView === "home") {
    return (
      <>
        <HomeView onCreateNew={handleCreateNew} onViewLibrary={() => setCurrentView("library")} />
        {showAuthFallback && (
          <AuthFallback onRetry={() => setShowAuthFallback(false)} onClose={() => setShowAuthFallback(false)} />
        )}
      </>
    )
  }

  if (currentView === "generator") {
    return <AlphabetGenerator onComplete={handleAlphabetGenerated} />
  }

  if (currentView === "create") {
    return (
      <>
        <div className="min-h-screen bg-black text-white">
          <Header
            title="Create New"
            showBack={true}
            onBack={() => setCurrentView("home")}
            username={farcasterProfile.username}
            avatarUrl={farcasterProfile.avatarUrl}
            isConnected={farcasterProfile.isConnected}
            isLoadingProfile={farcasterProfile.isLoading}
          />
          <div className="px-6 py-8 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-serif text-white">Create New Affirmations</h1>
                <p className="text-gray-400 font-sans">
                  Enter your child{"'"}s name to create personalized alphabet affirmations
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
                  onClick={handleNameSubmit}
                  disabled={!childName.trim()}
                  className="w-full"
                >
                  Create Alphabet
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Minting Dialog */}
        <MintingDialog
          childName={childName}
          isOpen={showMintingDialog}
          onClose={() => setShowMintingDialog(false)}
          onMint={handleMint}
        />
      </>
    )
  }

  if (currentView === "library") {
    return (
      <LibraryView
        collections={collections}
        onSelectCollection={handleSelectCollection}
        onCreateNew={handleCreateNew}
        onBack={() => setCurrentView("home")}
      />
    )
  }

  if (currentView === "alphabet") {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header
          title={`${childName}'s Alphabet`}
          showBack={true}
          onBack={() => setCurrentView("library")}
          username={farcasterProfile.username}
          avatarUrl={farcasterProfile.avatarUrl}
          isConnected={farcasterProfile.isConnected}
          isLoadingProfile={farcasterProfile.isLoading}
          actions={<ShareButton childName={childName} variant="success" onShare={() => {}} />}
        />
        <div className="px-6 py-4">
          <div className="max-w-md mx-auto">
            {/* Alphabet List */}
            <Card className="space-y-2 mb-8">
              {currentAffirmations.map((affirmation, index) => (
                <AffirmationCard
                  key={affirmation.letter}
                  letter={affirmation.letter}
                  word={affirmation.word}
                  childName={childName}
                  onClick={() => {
                    setCurrentLetter(index)
                    setCurrentView("reader")
                  }}
                />
              ))}
            </Card>

            {/* Actions */}
            <div className="space-y-4">
              <Button variant="primary" size="lg" onClick={handleStartReading} className="w-full">
                Start Reading
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === "reader") {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header
          showBack={true}
          onBack={() => setCurrentView("alphabet")}
          username={farcasterProfile.username}
          avatarUrl={farcasterProfile.avatarUrl}
          isConnected={farcasterProfile.isConnected}
          isLoadingProfile={farcasterProfile.isLoading}
        />
        <ReaderPage
          letter={currentLetterData?.letter || "A"}
          word={currentLetterData?.word || "Amazing"}
          childName={childName}
          currentPage={currentLetter + 1}
          totalPages={currentAffirmations.length}
          onNext={handleNext}
          onPrevious={handlePrevious}
          className="pt-0"
        />
      </div>
    )
  }

  return null
}
