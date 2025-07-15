"use client"

import { useState } from "react"
import { Button } from "./button"
import { Card } from "./card"
import { WalletStatusChip } from "./wallet-status-chip"
import { ShareButton } from "./share-button"
import { cn } from "@/lib/utils"

interface MintingDialogProps {
  childName: string
  isOpen: boolean
  onClose: () => void
  onMint: () => void
  className?: string
}

export function MintingDialog({ childName, isOpen, onClose, onMint, className }: MintingDialogProps) {
  const [mintingState, setMintingState] = useState<"idle" | "minting" | "success" | "error">("idle")
  const [walletStatus, setWalletStatus] = useState<"connected" | "connecting" | "insufficient" | "error">("connected")

  if (!isOpen) return null

  const handleMint = async () => {
    setMintingState("minting")
    try {
      await onMint()
      setMintingState("success")
    } catch (error) {
      setMintingState("error")
      setWalletStatus("error")
    }
  }

  const handleRetryWallet = () => {
    setWalletStatus("connecting")
    // Simulate retry
    setTimeout(() => setWalletStatus("connected"), 1000)
  }

  if (mintingState === "success") {
    return (
      <div className={cn("fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", className)}>
        <Card className="max-w-sm w-full text-center space-y-6">
          <div className="space-y-4">
            <div className="text-4xl">⭐</div>
            <h3 className="text-xl font-serif text-white">Success!</h3>
            <p className="text-gray-400 font-sans">
              {childName}
              {"'"}s alphabet is ready!
            </p>
          </div>

          <div className="space-y-3">
            <Button variant="primary" size="lg" onClick={onClose} className="w-full">
              Start Reading Now
            </Button>

            <ShareButton childName={childName} variant="success" onShare={() => {}} className="w-full justify-center" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", className)}>
      <Card className="max-w-sm w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-serif text-white">Mint for $5</h3>
          <p className="text-sm text-gray-400 font-sans">
            Create {childName}
            {"'"}s personalized alphabet NFT
          </p>
        </div>

        {/* Wallet Status */}
        <WalletStatusChip status={walletStatus} address="0x1234567890123456" onRetry={handleRetryWallet} />

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            onClick={handleMint}
            disabled={mintingState === "minting" || walletStatus !== "connected"}
            className="w-full"
          >
            {mintingState === "minting" ? "Minting..." : "Confirm Mint"}
          </Button>

          <Button variant="ghost" size="md" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  )
}
