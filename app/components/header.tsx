"use client"

import type React from "react"

import { ArrowLeft, X } from "lucide-react"
import { ProfileIndicator } from "./profile-indicator"
import { cn } from "@/lib/utils"

interface HeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
  onClose?: () => void
  actions?: React.ReactNode
  // Farcaster profile props
  username?: string
  avatarUrl?: string
  isConnected?: boolean
  isLoadingProfile?: boolean
  className?: string
}

export function Header({
  title,
  showBack = false,
  onBack,
  onClose,
  actions,
  username,
  avatarUrl,
  isConnected = false,
  isLoadingProfile = false,
  className,
}: HeaderProps) {
  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      // Default Farcaster close behavior
      if (typeof window !== "undefined" && window.parent) {
        window.parent.postMessage({ type: "close" }, "*")
      }
    }
  }

  return (
    <header
      className={cn(
        "flex items-center justify-between h-14 px-4 bg-black border-b border-gray-800",
        "sticky top-0 z-50 safe-area-top",
        className,
      )}
    >
      {/* Left Side - Back Button */}
      <div className="flex items-center min-w-0 flex-1">
        {showBack && onBack && (
          <button
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 -ml-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Center - Title */}
      <div className="flex-1 flex justify-center min-w-0">
        {title && <h1 className="text-base font-medium text-white font-serif truncate px-4">{title}</h1>}
      </div>

      {/* Right Side - Profile, Actions and Close */}
      <div className="flex items-center gap-1 min-w-0 flex-1 justify-end">
        {/* Profile Indicator - Subtle */}
        <ProfileIndicator
          username={username}
          avatarUrl={avatarUrl}
          isConnected={isConnected}
          isLoading={isLoadingProfile}
        />

        {actions}

        <button
          onClick={handleClose}
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Close miniapp"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
    </header>
  )
}
