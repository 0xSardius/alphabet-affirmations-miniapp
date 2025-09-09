"use client"

import { AlertCircle, CheckCircle, Loader2, Wallet } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface WalletStatusChipProps {
  status: "connected" | "connecting" | "insufficient" | "error"
  address?: string
  balance?: string
  onRetry?: () => void
  className?: string
}

export function WalletStatusChip({ status, address, onRetry, className }: WalletStatusChipProps) {
  const getStatusContent = () => {
    switch (status) {
      case "connected":
        return {
          icon: <CheckCircle className="w-4 h-4 text-gray-400" />,
          text: `Farcaster Wallet: ${address?.slice(0, 6)}...${address?.slice(-4)}`,
          bgClass: "bg-gray-900 border-gray-700",
          textClass: "text-gray-400",
        }

      case "connecting":
        return {
          icon: <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />,
          text: "Connecting to wallet...",
          bgClass: "bg-gray-900 border-gray-700",
          textClass: "text-gray-400",
        }

      case "insufficient":
        return {
          icon: <AlertCircle className="w-4 h-4 text-amber-400" />,
          text: `Insufficient balance - need $5 USDC`,
          bgClass: "bg-gray-900 border-amber-600",
          textClass: "text-amber-400",
        }

      case "error":
        return {
          icon: <AlertCircle className="w-4 h-4 text-red-400" />,
          text: "Transaction failed",
          bgClass: "bg-gray-900 border-red-600",
          textClass: "text-red-400",
        }

      default:
        return {
          icon: <Wallet className="w-4 h-4 text-gray-400" />,
          text: "Wallet status unknown",
          bgClass: "bg-gray-900 border-gray-700",
          textClass: "text-gray-400",
        }
    }
  }

  const { icon, text, bgClass, textClass } = getStatusContent()

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-sans", bgClass)}>
        {icon}
        <span className={textClass}>{text}</span>
      </div>

      {status === "error" && onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry} className="text-red-400 hover:text-red-300">
          Retry
        </Button>
      )}
    </div>
  )
}
