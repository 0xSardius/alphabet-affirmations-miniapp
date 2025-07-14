"use client"

import { useState } from "react"
import { HomeView } from "@/components/home-view"
import { LibraryView } from "@/components/library-view"
import { ReaderPage } from "@/components/reader-page"
import { AffirmationCard } from "@/components/affirmation-card"
import { Input } from "@/components/input"
import { Button } from "@/components/button"
import { Card } from "@/components/card"
import { Header } from "@/components/header"
import { ShareButton } from "@/components/share-button"
import { AddMiniAppBanner } from "@/components/add-miniapp-banner"
import { MintingDialog } from "@/components/minting-dialog"
import { AuthFallback } from "@/components/auth-fallback"
import { AlphabetGenerator } from "@/components/alphabet-generator"

// Sample affirmation words for each letter
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

export default function AlphabetAffirmations() {
  const [currentView, setCurrentView] = useState<View>("home")
  const [childName, setChildName] = useState("")
  const [currentLetter, setCurrentLetter] = useState(0)
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [isMiniAppAdded, setIsMiniAppAdded] = useState(false)
  const [showAddBanner, setShowAddBanner] = useState(true)
  const [showMintingDialog, setShowMintingDialog] = useState(false)
  const [showAuthFallback, setShowAuthFallback] = useState(false)

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

  const letters = Object.keys(affirmationWords)
  const currentLetterData = letters[currentLetter]
  const currentWord = affirmationWords[currentLetterData as keyof typeof affirmationWords]

  const handleCreateNew = () => {
    setCurrentView("generator")
    setChildName("")
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
    if (currentLetter < letters.length - 1) {
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
    return <AlphabetGenerator />
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
      <div className="min-h-screen bg-black text-white">
        <Header
          title="Your Collection"
          showBack={true}
          onBack={() => setCurrentView("home")}
          username={farcasterProfile.username}
          avatarUrl={farcasterProfile.avatarUrl}
          isConnected={farcasterProfile.isConnected}
          isLoadingProfile={farcasterProfile.isLoading}
        />

        {showAddBanner && (
          <AddMiniAppBanner
            isAdded={isMiniAppAdded}
            onAdd={() => setIsMiniAppAdded(true)}
            onDismiss={() => setShowAddBanner(false)}
          />
        )}

        <div className="px-6 py-4">
          <LibraryView
            collections={collections}
            onSelectCollection={handleSelectCollection}
            onCreateNew={handleCreateNew}
          />
        </div>
      </div>
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
              {letters.map((letter, index) => (
                <AffirmationCard
                  key={letter}
                  letter={letter}
                  word={affirmationWords[letter as keyof typeof affirmationWords]}
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
          letter={currentLetterData}
          word={currentWord}
          childName={childName}
          currentPage={currentLetter + 1}
          totalPages={letters.length}
          onNext={handleNext}
          onPrevious={handlePrevious}
          className="pt-0"
        />
      </div>
    )
  }

  return null
}
