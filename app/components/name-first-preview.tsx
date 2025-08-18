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

interface NameFirstPreviewProps {
  childName: string
  nameLetters: Affirmation[]
  sampleOthers: Affirmation[] // 4 non-name letters as teaser
  totalHiddenCount: number
  onStartReading: () => void
  onBack?: () => void
  className?: string
}

export function NameFirstPreview({
  childName,
  nameLetters,
  sampleOthers,
  totalHiddenCount,
  onStartReading,
  onBack,
  className,
}: NameFirstPreviewProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className={cn("min-h-screen bg-black text-white", className)}>
      <Header 
        title="Your Special Words"
        showBack={!!onBack}
        onBack={onBack}
      />
      
      <div className="px-6 py-8">
        <Card className="max-w-md mx-auto space-y-6">
          {/* Header Section */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-serif font-bold text-white">
              {childName}'s Special Words
            </h1>
            <div className="text-lg">⭐ Ready! ⭐</div>
          </div>

          {/* Child's Name Letters - Prominent Display */}
          <div className="space-y-3">
            {nameLetters.map((affirmation, index) => (
              <div 
                key={affirmation.letter}
                className={cn(
                  "flex items-center gap-4 bg-purple-900/30 p-4 rounded-lg border border-purple-500/50",
                  "transition-all duration-300 hover:bg-purple-900/40 hover:border-purple-500/70",
                  hoveredIndex === index && "bg-purple-900/40 border-purple-500/70 shadow-lg shadow-purple-500/20"
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <span className="text-2xl">🌟</span>
                <div className="flex-1">
                  <span className="text-xl font-serif font-semibold text-white">
                    {affirmation.letter.toUpperCase()} - {affirmation.word}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Teased Other Letters */}
          <div className="space-y-3">
            <p className="text-lg text-gray-300 font-sans">
              Plus {totalHiddenCount} more amazing words:
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              {sampleOthers.map((item) => (
                <div key={item.letter} className="text-gray-400 opacity-70 text-sm font-sans">
                  {item.letter} - {item.word.charAt(0)}{'•'.repeat(Math.max(1, item.word.length - 1))}
                </div>
              ))}
            </div>
            
            <p className="text-sm text-gray-400 font-sans">
              ... and {Math.max(0, totalHiddenCount - sampleOthers.length)} more surprises
            </p>
          </div>

          {/* Single CTA Button */}
          <div className="pt-4">
            <Button 
              variant="primary"
              size="lg"
              onClick={onStartReading}
              className="w-full py-4 text-lg font-bold hover:scale-[1.02] transition-transform duration-200"
            >
              Experience {childName}'s Complete Bedtime Alphabet
            </Button>
          </div>

          {/* Value Proposition */}
          <p className="text-xs text-gray-500 text-center font-sans leading-relaxed">
            See all 26 personalized words • Perfect for bedtime reading • Try before you buy
          </p>
        </Card>
      </div>
    </div>
  )
}
