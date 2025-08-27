"use client"

import { useState, useEffect } from "react"
import { useMiniKit, useAuthenticate } from "@coinbase/onchainkit/minikit"
import { Collection, loadCollections, createCollectionFromAffirmations } from "../lib/storage/collections"
import { HomeView } from "./components/home-view"
import { LibraryView } from "./components/library-view"
import { ReaderPage } from "./components/reader-page"
import { AffirmationCard } from "./components/affirmation-card"
import { Button } from "./components/button"
import { Card } from "./components/card"
import { Header } from "./components/header"
import { ShareButton } from "./components/share-button"
import { AddMiniAppBanner } from "./components/add-miniapp-banner"
import { AuthFallback } from "./components/auth-fallback"
import { AlphabetGenerator } from "./components/alphabet-generator"
import { MiniKitLoadingScreen } from "./components/minikit-loading-screen"
import { MintingDialog } from "./components/minting-dialog"
import { HybridPricingModal } from "./components/hybrid-pricing-modal"
import { WordCustomizer } from "./components/word-customizer"

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

type View = "home" | "library" | "reader" | "alphabet" | "generator"

type GeneratedAffirmation = {
  letter: string
  word: string
}

export default function AlphabetAffirmations() {
  const { setFrameReady, isFrameReady, context } = useMiniKit()
  const { signIn } = useAuthenticate()
  
  const [currentView, setCurrentView] = useState<View>("home")
  const [childName, setChildName] = useState("")
  const [currentLetter, setCurrentLetter] = useState(0)
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [isMiniAppAdded, setIsMiniAppAdded] = useState(false)
  const [showAddBanner, setShowAddBanner] = useState(true)
  const [showAuthFallback, setShowAuthFallback] = useState(false)
  const [showMintingDialog, setShowMintingDialog] = useState(false)
  const [showHybridPricingModal, setShowHybridPricingModal] = useState(false)
  const [selectedMintTier, setSelectedMintTier] = useState<"random" | "custom">("random")
  const [showWordCustomizer, setShowWordCustomizer] = useState(false)
  const [customizedAffirmations, setCustomizedAffirmations] = useState<{ letter: string; word: string }[]>([])
  
  // Authentication state
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  
  // Generated affirmations from AlphabetGenerator
  const [generatedAffirmations, setGeneratedAffirmations] = useState<GeneratedAffirmation[]>([])

  // Initialize MiniKit when component mounts
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady()
    }
  }, [isFrameReady, setFrameReady])

  // Automatic authentication when app loads
  useEffect(() => {
    const attemptAuthentication = async () => {
      // Check if user is already authenticated via context
      if (context?.user) {
        console.log('✅ User already authenticated:', {
          fid: context.user.fid,
          username: context.user.username,
          pfpUrl: context.user.pfpUrl
        })
        setAuthError(null)
        return
      }

      // If not authenticated and MiniKit is ready, attempt automatic sign-in
      if (isFrameReady && !context?.user && !isAuthenticating) {
        console.log('🔐 Starting automatic authentication...')
        setIsAuthenticating(true)
        setAuthError(null)
        
        try {
          const result = await signIn()
          console.log('🔐 Sign-in result:', result)

          if (result) {
            console.log('✅ Authentication successful')
            // The context should update automatically, triggering a re-render
          } else {
            console.warn('⚠️ Authentication returned no result')
            // Don't set error immediately - context might still update
            setTimeout(() => {
              if (!context?.user) {
                setAuthError('Please sign in to continue')
              }
            }, 2000)
          }
        } catch (error) {
          console.error('❌ Authentication error:', error)
          setAuthError('Unable to authenticate. Please try again.')
        } finally {
          setTimeout(() => setIsAuthenticating(false), 1000) // Give context time to update
        }
      }
    }

    // Only attempt authentication once MiniKit is ready
    if (isFrameReady) {
      attemptAuthentication()
    }
  }, [isFrameReady, context?.user, signIn, isAuthenticating])

  // Create profile object from real user data or fallback
  const farcasterProfile = {
    username: context?.user?.username || "user",
    avatarUrl: context?.user?.pfpUrl || "/placeholder.svg?height=24&width=24",
    isConnected: !!context?.user,
    isLoading: isAuthenticating,
    fid: context?.user?.fid,
  }

  // Real collections from localStorage
  const [collections, setCollections] = useState<Collection[]>([])

  // Load collections from localStorage on app start
  useEffect(() => {
    const savedCollections = loadCollections()
    setCollections(savedCollections)
    console.log('📚 Loaded', savedCollections.length, 'collections from storage')
  }, [])

  // Use generated affirmations if available, otherwise fall back to sample data
  const currentAffirmations = generatedAffirmations.length > 0 ? generatedAffirmations : 
    Object.entries(affirmationWords).map(([letter, word]) => ({ letter, word }))

  const currentLetterData = currentAffirmations[currentLetter]

  const handleCreateNew = () => {
    setCurrentView("generator")
    setChildName("")
    setGeneratedAffirmations([]) // Clear any existing generated affirmations
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
      // Load the collection's affirmations
      setGeneratedAffirmations(collection.affirmations)
      setCurrentLetter(0) // Start at first letter
      setCurrentView("reader") // Go directly to reader mode
      console.log('📖 Opened collection in reader:', collection.childName, 'with', collection.affirmations.length, 'affirmations')
    }
  }

  // Handler for when alphabet generation is complete
  const handleAlphabetGenerated = (affirmations: GeneratedAffirmation[], name: string) => {
    setGeneratedAffirmations(affirmations)
    setChildName(name)
    setCurrentView("alphabet")
  }

  // Handler for rerolling the current alphabet
  const handleReroll = () => {
    // Go back to generator to reroll
    setCurrentView("generator")
  }

  // Handler for showing hybrid pricing modal
  const handleShowPricing = () => {
    setShowHybridPricingModal(true)
  }

  // Handler for random mint ($0.99)
  const handleRandomMint = () => {
    setShowHybridPricingModal(false)
    setSelectedMintTier("random")
    setShowMintingDialog(true)
  }

  // Handler for custom mint ($5.00)
  const handleCustomMint = () => {
    setShowHybridPricingModal(false)
    setSelectedMintTier("custom")
    setCustomizedAffirmations(generatedAffirmations) // Start with current affirmations
    setShowWordCustomizer(true)
  }

  // Handler for generating new alphabet from pricing modal
  const handleGenerateFromModal = () => {
    setShowHybridPricingModal(false)
    handleReroll()
  }

  // Handler for saving customized words
  const handleSaveCustomizedWords = (customizedWords: { letter: string; word: string }[]) => {
    setCustomizedAffirmations(customizedWords)
    setGeneratedAffirmations(customizedWords) // Update the main affirmations
    setShowWordCustomizer(false)
    setShowMintingDialog(true) // Proceed to minting
  }

  // Handler for going back from word customizer
  const handleBackFromCustomizer = () => {
    setShowWordCustomizer(false)
    setShowHybridPricingModal(true) // Return to pricing modal
  }

  // Handler for custom upgrade upsell
  const handleCustomUpgrade = () => {
    setShowMintingDialog(false)
    setSelectedMintTier("custom")
    setCustomizedAffirmations(generatedAffirmations) // Start with current affirmations
    setShowWordCustomizer(true)
  }

  // Handler for completed minting
  const handleMintingComplete = () => {
    setShowMintingDialog(false)
    
    // Save the current alphabet to collections
    if (generatedAffirmations.length > 0 && childName) {
      const newCollection = createCollectionFromAffirmations(
        childName,
        generatedAffirmations,
        farcasterProfile.fid,
        selectedMintTier // Pass the tier for proper naming
      )
      
      // Update the collections state immediately
      setCollections(prev => [...prev, newCollection])
      setSelectedCollection(newCollection.id) // Mark as selected for proper back navigation
      
      console.log("💎 NFT minted and saved to collection:", childName)
    }
    
    // For infinite reroll cycle: Stay in alphabet view and generate new set
    handleReroll() // This will generate a new alphabet automatically
    
    // Show success state briefly (handled by MintingDialog success screen)
  }

  // Handler for "View as Reading" from minting success
  const handleViewAsReading = () => {
    setShowMintingDialog(false)
    setCurrentLetter(0) // Start at first letter
    setCurrentView("reader") // Go to reader mode
  }

  // Show loading screen while MiniKit initializes or authenticating
  if (!isFrameReady) {
    return <MiniKitLoadingScreen />
  }

  // Show loading screen while authenticating
  if (isAuthenticating) {
    return <MiniKitLoadingScreen />
  }

  // Show auth error if authentication failed
  if (authError && !context?.user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-serif text-white mb-4">Authentication Required</h2>
          <p className="text-gray-400 font-sans mb-6">{authError}</p>
          <Button 
            variant="primary" 
            onClick={() => {
              setAuthError(null)
              setIsAuthenticating(false)
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
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
    return <AlphabetGenerator onComplete={handleAlphabetGenerated} initialChildName={childName} />
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

            {/* Actions - Hybrid Pricing */}
            <div className="space-y-4">
              <Button variant="primary" size="lg" onClick={handleShowPricing} className="w-full">
                💜 Keep This Alphabet Forever
              </Button>
              
              <Button variant="secondary" size="lg" onClick={handleReroll} className="w-full">
                🎲 Generate New Set
              </Button>
            </div>
          </div>
        </div>

        {/* Hybrid Pricing Modal */}
        <HybridPricingModal
          childName={childName}
          isOpen={showHybridPricingModal}
          onRandomPurchase={handleRandomMint}
          onCustomPurchase={handleCustomMint}
          onGenerateNew={handleGenerateFromModal}
          onClose={() => setShowHybridPricingModal(false)}
        />

        {/* Minting Dialog */}
        <MintingDialog
          childName={childName}
          isOpen={showMintingDialog}
          onClose={() => setShowMintingDialog(false)}
          onMint={handleMintingComplete}
          onViewAsReading={handleViewAsReading}
          tier={selectedMintTier}
          onCustomUpgrade={handleCustomUpgrade}
          affirmations={generatedAffirmations}
        />

        {/* Word Customizer */}
        {showWordCustomizer && (
          <WordCustomizer
            childName={childName}
            affirmations={customizedAffirmations}
            onSave={handleSaveCustomizedWords}
            onBack={handleBackFromCustomizer}
          />
        )}
      </div>
    )
  }

  if (currentView === "reader") {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header
          showBack={true}
          onBack={() => setCurrentView(selectedCollection ? "library" : "alphabet")}
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
