"use client"

import { useState } from "react"
import { Button } from "./button"
import { Card } from "./card"
import { Sparkles, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface PartialPreviewProps {
  childName: string
  affirmations: Array<{
    letter: string
    word: string
  }>
  visibleCount?: number
  onMint: () => void
  onCustomize?: () => void
  isGenerating?: boolean
  className?: string
}

export function PartialPreview({
  childName,
  affirmations,
  visibleCount = 5,
  onMint,
  onCustomize,
  isGenerating = false,
  className,
}: PartialPreviewProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const visibleLetters = affirmations.slice(0, visibleCount)
  const partialLetters = affirmations.slice(visibleCount, visibleCount + 3)
  const hiddenCount = Math.max(0, affirmations.length - visibleCount - partialLetters.length)

  const formatPartialWord = (word: string) => {
    if (word.length <= 1) return word
    return word[0] + "•".repeat(Math.max(1, word.length - 1))
  }

  if (isGenerating) {
    return (
      <Card className={cn("max-w-md mx-auto", className)}>
        <div className="text-center py-12 space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto" />
          <h3 className="text-lg font-serif text-white">
            Creating {childName}
            {"'"}s Alphabet...
          </h3>
          <p className="text-gray-400 font-sans text-sm">Finding the perfect words for each letter</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn("max-w-md mx-auto overflow-hidden", className)}>
      {/* Child Name Header */}
      <div className="text-center py-6 px-4">
        <h2 className="text-2xl font-serif text-white font-semibold">{childName} is...</h2>
      </div>

      {/* Visible Letters Zone */}
      <div className="px-4 space-y-3">
        {visibleLetters.map((item, index) => (
          <div
            key={item.letter}
            className={cn(
              "flex items-center gap-4 py-2 rounded-lg transition-all duration-300",
              hoveredIndex === index && "bg-gray-800/30",
            )}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Letter Circle */}
            <div
              className={cn(
                "w-8 h-8 bg-white rounded-full flex items-center justify-center transition-all duration-300",
                hoveredIndex === index && "shadow-lg shadow-white/20 scale-105",
              )}
            >
              <span className="text-black font-bold text-base font-sans">{item.letter.toUpperCase()}</span>
            </div>

            {/* Word */}
            <div className="flex-1">
              <span
                className={cn(
                  "text-xl font-serif text-white font-medium transition-all duration-300",
                  hoveredIndex === index && "text-white/90",
                )}
              >
                {item.word}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Transition Separator */}
      <div className="relative my-6 mx-4">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black px-2">
          <span className="text-gray-500 text-xl">···</span>
        </div>
      </div>

      {/* Blurred Letters Zone */}
      <div className="px-4 space-y-2">
        {partialLetters.map((item, index) => (
          <div
            key={item.letter}
            className={cn(
              "flex items-center gap-4 py-2 transition-all duration-300",
              "opacity-60",
              index === 0 && "filter blur-[0.5px]",
              index === 1 && "filter blur-[1px] opacity-50",
              index === 2 && "filter blur-[2px] opacity-30",
            )}
          >
            {/* Blurred Letter Circle */}
            <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
              <span className="text-black/70 font-bold text-base font-sans">{item.letter.toUpperCase()}</span>
            </div>

            {/* Partial Word */}
            <div className="flex-1">
              <span className="text-xl font-serif text-gray-400 font-medium">{formatPartialWord(item.word)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Hidden Content Teaser */}
      <div className="mx-4 my-6">
        <div className="bg-gray-900/80 border border-dashed border-gray-700 rounded-xl p-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-base text-gray-400 font-sans">
              <span className="text-white font-semibold">{hiddenCount}</span> more amazing words waiting
            </span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-sm text-gray-500 font-sans">What incredible words did we pick for the rest?</p>
        </div>
      </div>

      {/* Call-to-Action Section */}
      <div className="p-6 space-y-3 bg-gradient-to-t from-gray-900/50 to-transparent">
        {/* Primary CTA */}
        <Button
          variant="primary"
          size="lg"
          onClick={onMint}
          className="w-full text-base font-semibold py-4 hover:scale-[1.02] transition-transform duration-200 flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Mint All 26 Words - $5
        </Button>

        {/* Secondary CTA */}
        {onCustomize && (
          <Button
            variant="secondary"
            size="md"
            onClick={onCustomize}
            className="w-full text-sm hover:border-gray-500 hover:text-white transition-all duration-200"
          >
            Customize Words First +$3
          </Button>
        )}

        {/* Value Proposition */}
        <p className="text-xs text-gray-500 text-center font-sans leading-relaxed">
          Complete personalized alphabet • Bedtime reading • Educational NFT
        </p>
      </div>
    </Card>
  )
}
