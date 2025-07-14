"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  children: ReactNode
  disabled?: boolean
  className?: string
  onClick?: () => void
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  disabled = false,
  className,
  onClick,
}: ButtonProps) {
  const baseStyles = "font-medium rounded-lg transition-all duration-200 font-sans"

  const variants = {
    primary: "bg-white text-black hover:bg-gray-100 active:bg-gray-200",
    secondary: "bg-transparent text-white border border-gray-700 hover:border-white hover:bg-gray-800",
    ghost: "bg-transparent text-gray-500 hover:text-white hover:bg-gray-800",
  }

  const sizes = {
    sm: "h-8 px-3 text-sm min-w-[44px]",
    md: "h-10 px-4 text-base min-w-[44px]",
    lg: "h-12 px-6 text-lg min-w-[44px]",
  }

  const disabledStyles = "opacity-50 cursor-not-allowed hover:bg-current hover:border-current"

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], disabled && disabledStyles, className)}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
