"use client"

import { Card } from "./card"

interface MiniKitLoadingScreenProps {
  appName?: string
  iconUrl?: string
}

export function MiniKitLoadingScreen({ 
  appName = "Alphabet Affirmations", 
  iconUrl = "/icon.png" 
}: MiniKitLoadingScreenProps) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <Card className="max-w-sm w-full text-center py-12 px-8">
        {/* App Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center relative">
            {iconUrl && (
              <img 
                src={iconUrl} 
                alt={`${appName} icon`}
                className="w-12 h-12 rounded-xl absolute inset-0 m-auto"
                onError={(e) => {
                  // Hide image on error, show fallback letter
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
            <span className="text-white text-2xl font-bold relative z-10">
              {appName.charAt(0)}
            </span>
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-xl font-serif text-white mb-3">{appName}</h1>
        
        {/* Loading Indicator */}
        <div className="mb-6">
          <div className="w-8 h-8 mx-auto">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Loading Text */}
        <p className="text-gray-400 text-sm font-sans">
          Loading your magical alphabet...
        </p>

        {/* Powered by Farcaster */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-gray-600 text-xs font-sans flex items-center justify-center gap-2">
            <span>Powered by</span>
            <span className="text-purple-400 font-medium">Farcaster</span>
          </p>
        </div>
      </Card>
    </div>
  )
} 