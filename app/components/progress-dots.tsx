"use client"

import { cn } from "@/lib/utils"

interface ProgressDotsProps {
  total: number
  current: number
  currentLetter?: string
  className?: string
  showTextIndicator?: boolean
}

export function ProgressDots({ 
  total, 
  current, 
  currentLetter,
  className,
  showTextIndicator = true 
}: ProgressDotsProps) {
  const maxDots = 7
  const showEllipsis = total > maxDots

  const renderDots = () => {
    if (!showEllipsis) {
      return Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-full transition-all duration-300",
            i + 1 === current 
              ? "w-3 h-3 bg-white shadow-lg shadow-white/25" // Current page - larger and glowing
              : i + 1 < current 
              ? "w-2 h-2 bg-white/80" // Completed pages
              : "w-1.5 h-1.5 bg-gray-600" // Future pages
          )}
        />
      ))
    }

    // Show first few, ellipsis, and current area for long sequences
    const dots = []
    const showFirst = 2
    const showLast = 2
    const showAround = 1 // Show dots around current position

    // Helper function to create dot
    const createDot = (index: number) => (
      <div
        key={index}
        className={cn(
          "rounded-full transition-all duration-300",
          index + 1 === current 
            ? "w-3 h-3 bg-white shadow-lg shadow-white/25"
            : index + 1 < current 
            ? "w-2 h-2 bg-white/80"
            : "w-1.5 h-1.5 bg-gray-600"
        )}
      />
    )

    // First dots
    for (let i = 0; i < Math.min(showFirst, current - showAround - 1); i++) {
      dots.push(createDot(i))
    }

    // First ellipsis
    if (current > showFirst + showAround + 2) {
      dots.push(
        <span key="ellipsis-start" className="text-gray-500 text-xs px-1">
          ···
        </span>
      )
    }

    // Current area (current - showAround to current + showAround)
    const startAround = Math.max(0, current - showAround - 1)
    const endAround = Math.min(total - 1, current + showAround - 1)
    
    for (let i = startAround; i <= endAround; i++) {
      dots.push(createDot(i))
    }

    // Last ellipsis
    if (current < total - showLast - showAround) {
      dots.push(
        <span key="ellipsis-end" className="text-gray-500 text-xs px-1">
          ···
        </span>
      )
    }

    // Last dots
    const lastStart = Math.max(endAround + 1, total - showLast)
    for (let i = lastStart; i < total; i++) {
      dots.push(createDot(i))
    }

    return dots
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* Text Indicators - Perfect for bedtime reading */}
      {showTextIndicator && (
        <div className="flex flex-col items-center gap-1">
          {currentLetter && (
            <div className="text-white/90 text-sm font-medium font-sans">
              Letter {currentLetter.toUpperCase()}
            </div>
          )}
          <div className="text-gray-400 text-xs font-sans">
            {current} of {total}
          </div>
        </div>
      )}

      {/* Visual Dots - Quick visual reference */}
      <div className="flex items-center justify-center gap-2">
        {renderDots()}
      </div>
    </div>
  )
}
