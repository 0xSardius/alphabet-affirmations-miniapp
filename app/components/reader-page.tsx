"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface ReaderPageProps {
  letter: string
  word: string
  childName: string
  currentPage: number
  totalPages: number
  onNext?: () => void
  onPrevious?: () => void
  className?: string
}

export function ReaderPage({
  letter,
  word,
  childName,
  currentPage,
  totalPages,
  onNext,
  onPrevious,
  className,
}: ReaderPageProps) {
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  return (
    <div className={cn("flex flex-col min-h-screen bg-black text-white", "px-6 py-8 justify-between", className)}>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Child Name */}
        <p className="text-gray-400 text-lg font-sans text-center">{childName} is...</p>

        {/* Letter Circle */}
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
          <span className="text-black font-bold text-5xl font-sans">{letter.toUpperCase()}</span>
        </div>

        {/* Word - Clean and prominent */}
        <h1 className="text-6xl font-serif font-medium text-center leading-tight">
          {word}
        </h1>
      </div>

      {/* Touch-Friendly Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="ghost"
          size="lg"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={cn(
            "flex items-center gap-2 h-12 px-6",
            !canGoPrevious ? "opacity-30" : "hover:bg-white/10"
          )}
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </Button>

        <Button 
          variant="ghost" 
          size="lg" 
          onClick={onNext} 
          disabled={!canGoNext} 
          className={cn(
            "flex items-center gap-2 h-12 px-6",
            !canGoNext ? "opacity-30" : "hover:bg-white/10"
          )}
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
