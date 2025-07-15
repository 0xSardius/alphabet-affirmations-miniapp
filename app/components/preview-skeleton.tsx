"use client"

import { Card } from "./card"
import { cn } from "@/lib/utils"

interface PreviewSkeletonProps {
  childName: string
  className?: string
}

export function PreviewSkeleton({ childName, className }: PreviewSkeletonProps) {
  return (
    <Card className={cn("max-w-md mx-auto", className)}>
      {/* Child Name Header */}
      <div className="text-center py-6 px-4">
        <h2 className="text-2xl font-serif text-white font-semibold">{childName} is...</h2>
      </div>

      {/* Skeleton Letters */}
      <div className="px-4 space-y-3">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 py-2">
            {/* Letter Circle Skeleton */}
            <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" />

            {/* Word Skeleton */}
            <div className="flex-1">
              <div
                className={cn(
                  "h-6 bg-gray-700 rounded animate-pulse",
                  index === 0 && "w-20", // Amazing
                  index === 1 && "w-16", // Brave
                  index === 2 && "w-24", // Creative
                  index === 3 && "w-28", // Determined
                  index === 4 && "w-22", // Excellent
                )}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Loading Message */}
      <div className="text-center py-8 space-y-2">
        <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto" />
        <p className="text-gray-400 font-sans text-sm">Finding perfect words...</p>
      </div>
    </Card>
  )
}
