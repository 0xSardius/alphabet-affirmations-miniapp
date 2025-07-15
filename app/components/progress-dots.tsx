"use client"

import { cn } from "@/lib/utils"

interface ProgressDotsProps {
  total: number
  current: number
  className?: string
}

export function ProgressDots({ total, current, className }: ProgressDotsProps) {
  const maxDots = 7
  const showEllipsis = total > maxDots

  const renderDots = () => {
    if (!showEllipsis) {
      return Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-full transition-all duration-200",
            i < current ? "w-2 h-2 bg-white" : "w-1.5 h-1.5 bg-gray-600",
          )}
        />
      ))
    }

    // Show first few, ellipsis, and current area
    const dots = []
    const showFirst = 3
    const showLast = 2

    // First dots
    for (let i = 0; i < showFirst; i++) {
      dots.push(
        <div
          key={i}
          className={cn(
            "rounded-full transition-all duration-200",
            i < current ? "w-2 h-2 bg-white" : "w-1.5 h-1.5 bg-gray-600",
          )}
        />,
      )
    }

    // Ellipsis
    if (current > showFirst && current < total - showLast) {
      dots.push(
        <span key="ellipsis" className="text-gray-600 text-xs">
          ...
        </span>,
      )
    }

    // Last dots
    for (let i = Math.max(showFirst, total - showLast); i < total; i++) {
      dots.push(
        <div
          key={i}
          className={cn(
            "rounded-full transition-all duration-200",
            i < current ? "w-2 h-2 bg-white" : "w-1.5 h-1.5 bg-gray-600",
          )}
        />,
      )
    }

    return dots
  }

  return <div className={cn("flex items-center justify-center gap-2", className)}>{renderDots()}</div>
}
