"use client"

import { Baby } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface HomeViewProps {
  onCreateNew: () => void
  onViewLibrary: () => void
  className?: string
}

export function HomeView({ onCreateNew, onViewLibrary, className }: HomeViewProps) {
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

      {/* Actions */}
      <div className="space-y-4 w-full max-w-sm">
        <Button variant="primary" size="lg" onClick={onCreateNew} className="w-full">
          Create New Affirmations
        </Button>

        <Button variant="secondary" size="lg" onClick={onViewLibrary} className="w-full">
          Read My Collection
        </Button>
      </div>
    </div>
  )
}
