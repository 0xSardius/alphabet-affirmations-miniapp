"use client"

import { Book } from "lucide-react"
import { cn } from "@/lib/utils"

interface NFTCollectionCardProps {
  childName: string
  letterCount: number
  mintDate: string
  thumbnailLetters?: string[]
  onRead: () => void
  className?: string
}

export function NFTCollectionCard({
  childName,
  letterCount,
  mintDate,
  thumbnailLetters = [],
  onRead,
  className,
}: NFTCollectionCardProps) {
  return (
    <div
      className={cn(
        "bg-gray-900 border border-gray-700 rounded-xl p-6",
        "cursor-pointer hover:border-gray-500 hover:bg-gray-800",
        "transition-all duration-200",
        className,
      )}
      onClick={onRead}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-xl font-serif text-white mb-2 truncate">
            {childName}
            {"'"}s Alphabet
          </h3>

          {/* Metadata */}
          <p className="text-sm text-gray-400 font-sans mb-3">
            {letterCount} letters • Created {mintDate}
          </p>

          {/* Thumbnail Letters */}
          {thumbnailLetters.length > 0 && (
            <div className="flex gap-2">
              {thumbnailLetters.slice(0, 4).map((letter, index) => (
                <div key={index} className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-xs font-sans">{letter.toUpperCase()}</span>
                </div>
              ))}
              {thumbnailLetters.length > 4 && (
                <span className="text-gray-500 text-xs self-center">+{thumbnailLetters.length - 4} more</span>
              )}
            </div>
          )}
        </div>

        {/* Action Icon */}
        <div className="flex-shrink-0 ml-4">
          <Book className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  )
}
