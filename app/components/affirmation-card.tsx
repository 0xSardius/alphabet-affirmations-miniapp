"use client"

import { cn } from "@/lib/utils"

interface AffirmationCardProps {
  letter: string
  word: string
  childName?: string
  isActive?: boolean
  onClick?: () => void
  className?: string
}

export function AffirmationCard({
  letter,
  word,
  childName,
  isActive = false,
  onClick,
  className,
}: AffirmationCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg transition-all duration-200",
        onClick && "cursor-pointer hover:bg-gray-800",
        isActive && "ring-1 ring-white bg-gray-800",
        className,
      )}
      onClick={onClick}
    >
      {/* Letter Circle */}
      <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center">
        <span className="text-black font-bold text-lg font-sans">{letter.toUpperCase()}</span>
      </div>

      {/* Word Content */}
      <div className="flex-1 min-w-0">
        {childName && <p className="text-gray-400 text-sm font-sans mb-1">{childName} is...</p>}
        <p className="text-white text-xl font-serif font-medium">{word}</p>
      </div>
    </div>
  )
}
