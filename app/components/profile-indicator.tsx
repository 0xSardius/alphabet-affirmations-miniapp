"use client"

import { User } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileIndicatorProps {
  username?: string
  avatarUrl?: string
  isConnected: boolean
  isLoading?: boolean
  className?: string
}

export function ProfileIndicator({
  username,
  avatarUrl,
  isConnected,
  isLoading = false,
  className,
}: ProfileIndicatorProps) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center w-11 h-11 -mr-2", className)}>
        <div className="w-6 h-6 bg-gray-700 rounded-full animate-pulse" />
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className={cn("flex items-center justify-center w-11 h-11 -mr-2", className)}>
        <User className="w-6 h-6 text-gray-500" />
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-1.5 text-gray-500 pr-2", className)}>
      {/* Avatar */}
      <div className="w-6 h-6 rounded-full border border-gray-700 overflow-hidden bg-gray-700 flex-shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl || "/placeholder.svg"}
            alt={username || "Profile"}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-4 h-4 text-gray-500 m-1" />
        )}
      </div>

      {/* Username */}
      {username && <span className="text-xs font-sans text-gray-500 max-w-16 truncate">@{username}</span>}
    </div>
  )
}
