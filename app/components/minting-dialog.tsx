"use client"

import { useState } from "react"
import { Button } from "./button"
import { Card } from "./card"
import { WalletStatusChip } from "./wallet-status-chip"
import { ShareButton } from "./share-button"
import { cn } from "@/lib/utils"
import { CONTRACTS, PRICING } from "@/lib/constants/contracts"
import { AlphabetAffirmationsNFTV2ABI } from "@/lib/contracts/AlphabetAffirmationsNFTV2.abi"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"
import React from "react"

interface MintingDialogProps {
  childName: string
  isOpen: boolean
  onClose: () => void
  onMint: () => void
  tier?: "random" | "custom"
  onCustomUpgrade?: () => void // New callback for upsell
  className?: string
}

export function MintingDialog({ childName, isOpen, onClose, onMint, tier = "random", onCustomUpgrade, className }: MintingDialogProps) {
  const [mintingState, setMintingState] = useState<"idle" | "minting" | "success" | "error">("idle")
  
  // Wagmi hooks for blockchain interaction
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  if (!isOpen) return null

  // Update minting state based on transaction status
  React.useEffect(() => {
    if (isPending) setMintingState("minting")
    if (isSuccess) setMintingState("success")
    if (error) setMintingState("error")
  }, [isPending, isSuccess, error])

  const handleMint = async () => {
    if (!address || !isConnected) {
      console.error("Wallet not connected")
      return
    }

    try {
      const mintPrice = tier === "random" ? PRICING.RANDOM_TIER : PRICING.CUSTOM_TIER
      
      // Call the contract mint function
      writeContract({
        address: CONTRACTS.ALPHABET_NFT_V2.address as `0x${string}`,
        abi: AlphabetAffirmationsNFTV2ABI,
        functionName: "mintAlphabet",
        args: [
          address,
          tier === "random" ? 0 : 1, // MintTier enum: RANDOM = 0, CUSTOM = 1
          `https://example.com/metadata/${childName}`, // TODO: Generate proper metadata
          [], // customizedLetters - empty for random tier
          [] // nameLetters - TODO: extract from childName
        ],
        value: parseEther(mintPrice),
      })
    } catch (error) {
      console.error("Minting error:", error)
      setMintingState("error")
    }
  }

  // Handle successful mint
  React.useEffect(() => {
    if (isSuccess) {
      onMint() // Call the parent's onMint callback for collection saving
    }
  }, [isSuccess, onMint])



  if (mintingState === "success") {
    return (
      <div className={cn("fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", className)}>
        <Card className="max-w-sm w-full text-center space-y-6">
          <div className="space-y-4">
            <div className="text-4xl">⭐</div>
            <h3 className="text-xl font-serif text-white">NFT Minted!</h3>
            <p className="text-gray-400 font-sans">
              {childName}{"'"}s {tier} alphabet is now yours forever!
            </p>
            <p className="text-sm text-purple-400 font-sans">
              ✨ Try minting another unique set!
            </p>
          </div>

          <div className="space-y-3">
            <Button variant="primary" size="lg" onClick={onClose} className="w-full">
              🎲 Generate New Alphabet
            </Button>

            {/* Upsell for random mints */}
            {tier === "random" && onCustomUpgrade && (
              <Button variant="secondary" size="lg" onClick={onCustomUpgrade} className="w-full">
                ✨ Make Perfect Custom Set - $5
              </Button>
            )}

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
          <h3 className="text-xl font-serif text-white">
            Mint for {tier === "random" ? "$0.99" : "$5.00"}
          </h3>
          <p className="text-sm text-gray-400 font-sans">
            Create {childName}{"'"}s {tier === "random" ? "random" : "custom"} alphabet NFT
          </p>
        </div>

        {/* Wallet Status */}
        <WalletStatusChip 
          status={isConnected ? "connected" : "error"} 
          address={address || "Not connected"} 
          onRetry={() => {}} 
        />

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            onClick={handleMint}
            disabled={isPending || isConfirming || !isConnected}
            className="w-full"
          >
            {isPending || isConfirming ? "Minting..." : "Confirm Mint"}
          </Button>

          <Button variant="ghost" size="md" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  )
}

