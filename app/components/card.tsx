"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface CardProps {
  children: ReactNode
  variant?: "default" | "bordered" | "dashed"
  padding?: "sm" | "md" | "lg"
  className?: string
  onClick?: () => void
}

export function Card({ children, variant = "default", padding = "md", className, onClick }: CardProps) {
  const baseStyles = "bg-gray-900 rounded-xl transition-all duration-200"

  const variants = {
    default: "border border-gray-700",
    bordered: "border-2 border-gray-600",
    dashed: "border-2 border-dashed border-gray-600",
  }

  const paddings = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  }

  const interactiveStyles = onClick ? "cursor-pointer hover:border-gray-500 hover:bg-gray-800" : ""

  return (
    <div
      className={cn(baseStyles, variants[variant], paddings[padding], interactiveStyles, className)}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
