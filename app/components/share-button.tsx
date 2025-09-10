"use client"

import { Share2, Loader2 } from "lucide-react"
import { useState } from "react"
import { useComposeCast } from "@coinbase/onchainkit/minikit"
import { cn } from "@/lib/utils"

interface ShareButtonProps {
  childName: string
  variant: "success" | "milestone" | "completion"
  isSharing?: boolean
  onShare: () => void
  className?: string
}

export function ShareButton({ childName, variant, isSharing = false, onShare, className }: ShareButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { composeCast } = useComposeCast()

  const getShareText = () => {
    switch (variant) {
      case "success":
        return `Just minted ${childName}'s personalized alphabet affirmations! 🎯✨\n\nMint yours now! ↗️`
      case "completion":
        return `${childName} completed their alphabet affirmations! 📚💫`
      case "milestone":
        return `${childName} reached a new milestone! 🌟`
      default:
        return `Check out ${childName}'s alphabet affirmations! 🎯`
    }
  }

  const handleShare = async () => {
    if (isSharing) return

    try {
      // Use MiniKit's composeCast hook for proper in-app sharing
      composeCast({
        text: getShareText(),
        embeds: [window.location.origin]
      })
      
      onShare()
    } catch (error) {
      console.error("Failed to share:", error)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-md border transition-all duration-200",
        "bg-transparent border-gray-700 text-gray-400 text-sm font-sans",
        "hover:border-purple-500 hover:text-purple-400",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "min-h-[44px] min-w-[44px]", // Touch target
        className,
      )}
    >
      {isSharing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Share2 className={cn("w-4 h-4 transition-colors", isHovered && "text-purple-400")} />
      )}
      <span>{isSharing ? "Sharing..." : "Share to Farcaster"}</span>
    </button>
  )
}
