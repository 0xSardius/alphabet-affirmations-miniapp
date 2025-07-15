"use client"

import { cn } from "@/lib/utils"

interface InputProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  maxLength?: number
  disabled?: boolean
  error?: string
  className?: string
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  maxLength,
  disabled = false,
  error,
  className,
}: InputProps) {
  return (
    <div className={cn("w-full", className)}>
      {label && <label className="block text-sm text-gray-400 mb-2 font-sans">{label}</label>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={cn(
          "w-full h-12 px-4 bg-gray-900 border border-gray-700 rounded-lg",
          "text-white text-lg text-center font-sans placeholder:text-gray-600",
          "focus:outline-none focus:ring-2 focus:ring-white focus:border-white",
          "transition-all duration-200",
          error && "border-red-500 focus:ring-red-500 focus:border-red-500",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      />
      {error && <p className="mt-2 text-sm text-red-400 font-sans">{error}</p>}
    </div>
  )
}
