"use client"

import { useState } from "react"
import { Button } from "./button"
import { Card } from "./card"
import { cn } from "@/lib/utils"

export type PricingTier = 'random' | 'custom'

interface HybridPricingModalProps {
  childName: string
  isOpen: boolean
  onRandomPurchase: () => void
  onCustomPurchase: () => void
  onGenerateNew: () => void
  onClose: () => void
  className?: string
}

export function HybridPricingModal({
  childName,
  isOpen,
  onRandomPurchase,
  onCustomPurchase,
  onGenerateNew,
  onClose,
  className,
}: HybridPricingModalProps) {
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null)

  if (!isOpen) return null

  const handleTierSelect = (tier: PricingTier) => {
    setSelectedTier(tier)
    if (tier === 'random') {
      onRandomPurchase()
    } else {
      onCustomPurchase()
    }
  }

  return (
    <div className={cn("fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4", className)}>
      <Card className="max-w-sm w-full space-y-6 border border-gray-700">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-serif font-bold text-white">
            {childName} loved their letters!
          </h2>
          <div className="text-2xl">💜 ⭐ 💜</div>
          <p className="text-gray-300 font-sans">
            How would you like to keep this alphabet forever?
          </p>
        </div>
        
        {/* Random Tier Option */}
        <div 
          className={cn(
            "border border-gray-600 rounded-lg p-4 space-y-3 cursor-pointer transition-all duration-200",
            "hover:border-gray-500 hover:bg-gray-800/30",
            selectedTier === 'random' && "border-green-500 bg-green-900/20"
          )}
          onClick={() => handleTierSelect('random')}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <h3 className="font-serif font-bold text-white">Random Keepsake</h3>
          </div>
          <p className="text-sm text-gray-300 font-sans">
            Keep these exact words forever
          </p>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">0.0003 ETH</div>
            <Button 
              variant="primary"
              size="md"
              onClick={() => handleTierSelect('random')}
              className="w-full mt-2 bg-green-600 hover:bg-green-500 border-green-600"
            >
              Keep This Alphabet
            </Button>
          </div>
        </div>
        
        {/* Custom Tier Option */}
        <div 
          className={cn(
            "border border-purple-500 rounded-lg p-4 space-y-3 cursor-pointer transition-all duration-200",
            "bg-purple-900/20 hover:bg-purple-900/30",
            selectedTier === 'custom' && "border-purple-400 bg-purple-900/40"
          )}
          onClick={() => handleTierSelect('custom')}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <h3 className="font-serif font-bold text-white">Custom Keepsake</h3>
          </div>
          <p className="text-sm text-gray-300 font-sans">
            Pick perfect words for {childName} first
          </p>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">0.0015 ETH</div>
            <Button 
              variant="primary"
              size="md"
              onClick={() => handleTierSelect('custom')}
              className="w-full mt-2 bg-purple-600 hover:bg-purple-500 border-purple-600"
            >
              Customize Words First
            </Button>
          </div>
        </div>
        
        {/* Alternative Actions */}
        <div className="space-y-2 border-t border-gray-700 pt-4">
          <Button 
            variant="ghost"
            size="sm"
            onClick={onGenerateNew}
            className="w-full text-gray-400 hover:text-white"
          >
            🎲 Try Different Words (Free)
          </Button>
          <div className="text-xs text-center text-gray-500 font-sans">
            Reroll as many times as you want • Mint your favorites
          </div>
          <Button 
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-full text-gray-500 hover:text-gray-300"
          >
            Back to Reading
          </Button>
        </div>
      </Card>
    </div>
  )
}
