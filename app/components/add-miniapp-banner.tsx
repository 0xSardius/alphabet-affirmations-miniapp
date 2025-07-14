"use client"

import { Bookmark, X } from "lucide-react"
import { Button } from "./button"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface AddMiniAppBannerProps {
  isAdded: boolean
  onAdd: () => void
  onDismiss?: () => void
  className?: string
}

export function AddMiniAppBanner({ isAdded, onAdd, onDismiss, className }: AddMiniAppBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  return (
    <div
      className={cn(
        "bg-gray-900 border border-gray-700 rounded-lg p-4 mx-4 mb-4",
        "flex items-center justify-between gap-3",
        className,
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Bookmark className={cn("w-5 h-5 flex-shrink-0", isAdded ? "text-white" : "text-gray-400")} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">{isAdded ? "Added to your apps ✓" : "Add to your apps"}</p>
          <p className="text-xs text-gray-400">
            {isAdded ? "Access anytime from your Farcaster apps" : "Quick access from your Farcaster home"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isAdded && (
          <Button variant="primary" size="sm" onClick={onAdd}>
            Add
          </Button>
        )}
        <button
          onClick={handleDismiss}
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  )
}
