"use client"

import { AlertCircle, RefreshCw, X } from "lucide-react"
import { Button } from "./button"
import { Card } from "./card"
import { cn } from "@/lib/utils"

interface AuthFallbackProps {
  onRetry: () => void
  onClose: () => void
  className?: string
}

export function AuthFallback({ onRetry, onClose, className }: AuthFallbackProps) {
  return (
    <div className={cn("fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", className)}>
      <Card className="max-w-sm w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <AlertCircle className="w-12 h-12 text-gray-400" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-serif text-white">Connection Issue</h3>
          <p className="text-sm text-gray-400 font-sans leading-relaxed">
            Please open this app through Farcaster to continue with your personalized alphabet experience.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button variant="primary" size="md" onClick={onRetry} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </Button>

          <Button variant="ghost" size="md" onClick={onClose} className="flex items-center gap-2">
            <X className="w-4 h-4" />
            Close
          </Button>
        </div>
      </Card>
    </div>
  )
}
