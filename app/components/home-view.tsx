"use client"

import { Baby } from "lucide-react"
import { Button } from "./button"
import { FAQSection } from "./faq-section"
import { AddMiniAppBanner } from "./add-miniapp-banner"
import { useAddFrame } from "@coinbase/onchainkit/minikit"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface HomeViewProps {
  onCreateNew: () => void
  onViewLibrary: () => void
  className?: string
}

export function HomeView({ onCreateNew, onViewLibrary, className }: HomeViewProps) {
  const [isAdded, setIsAdded] = useState(false)
  const [showBanner, setShowBanner] = useState(true)
  const [hasTriggeredAutoAdd, setHasTriggeredAutoAdd] = useState(false)
  const addFrame = useAddFrame()

  const handleAddFrame = async () => {
    const result = await addFrame()
    if (result) {
      setIsAdded(true)
      console.log('Frame added:', result.url, result.token)
    }
  }

  // Automatically trigger add frame modal on first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('alphabet-affirmations-visited')
    
    if (!hasVisited && !hasTriggeredAutoAdd && !isAdded) {
      // Mark as visited to prevent future auto-triggers
      localStorage.setItem('alphabet-affirmations-visited', 'true')
      setHasTriggeredAutoAdd(true)
      
      // Small delay to ensure component is fully mounted
      setTimeout(() => {
        handleAddFrame()
      }, 500)
    }
  }, [hasTriggeredAutoAdd, isAdded])

  return (
    <div
      className={cn(
        "flex flex-col min-h-screen bg-black text-white",
        "px-6 py-8 justify-center items-center text-center",
        className,
      )}
    >
      {/* Hero Section */}
      <div className="space-y-6 mb-12">
        {/* Icon */}
        <div className="flex justify-center">
          <Baby className="w-16 h-16 text-gray-400" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-serif text-white leading-tight">Alphabet Affirmations</h1>

        {/* Description */}
        <p className="text-lg text-gray-400 font-sans max-w-sm leading-relaxed">
          Educational alphabet that teaches ABCs while building confidence
        </p>
      </div>

      {/* Add Frame Banner - Only show if user manually dismissed the auto-modal or if already added */}
      {showBanner && (hasTriggeredAutoAdd || isAdded) && (
        <div className="w-full max-w-sm mb-6">
          <AddMiniAppBanner
            isAdded={isAdded}
            onAdd={handleAddFrame}
            onDismiss={() => setShowBanner(false)}
          />
        </div>
      )}

      {/* Actions */}
      <div className="space-y-4 w-full max-w-sm">
        <Button variant="primary" size="lg" onClick={onCreateNew} className="w-full">
          Create New Affirmations
        </Button>

        <Button variant="secondary" size="lg" onClick={onViewLibrary} className="w-full">
          Read My Collection
        </Button>
      </div>

      {/* FAQ Section */}
      <div className="mt-8 w-full max-w-sm">
        <FAQSection />
      </div>
    </div>
  )
}
