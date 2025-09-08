"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "What are alphabet affirmations?",
    answer: "Personalized A-Z affirmations for your child like 'Emma is Amazing, Brilliant, Creative...' that build confidence while teaching letters."
  },
  {
    question: "How is it personalized?",
    answer: "Each alphabet is uniquely generated based on your child's name and your Farcaster identity - no two are exactly alike!"
  },
  {
    question: "What's the difference between price tiers?",
    answer: "Random tier gets you a beautiful generated alphabet. Custom tier lets you personalize specific words before minting (like changing 'Quirky' to 'Quiet')."
  },
  {
    question: "What do I get when I mint?",
    answer: "A permanent NFT on Base blockchain that you own forever, plus an interactive bedtime reading experience for your child."
  },
  {
    question: "Can I try before I buy?",
    answer: "Yes! Generate and preview your child's full alphabet for free. Only pay when you're ready to mint it as an NFT."
  }
]

interface FAQSectionProps {
  className?: string
}

export function FAQSection({ className }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [showFAQ, setShowFAQ] = useState(false)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  if (!showFAQ) {
    return (
      <div className={cn("w-full max-w-sm", className)}>
        <button
          onClick={() => setShowFAQ(true)}
          className="w-full text-sm text-gray-500 hover:text-gray-400 transition-colors py-2"
        >
          ❓ How it works & FAQ
        </button>
      </div>
    )
  }

  return (
    <div className={cn("w-full max-w-sm space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif text-white">How it works</h3>
        <button
          onClick={() => setShowFAQ(false)}
          className="text-gray-500 hover:text-gray-400 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-800 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-900/50 transition-colors"
            >
              <span className="text-sm font-medium text-white">
                {faq.question}
              </span>
              {openIndex === index ? (
                <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
            </button>
            
            {openIndex === index && (
              <div className="px-4 pb-3 pt-0">
                <p className="text-sm text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-gray-800">
        <p className="text-xs text-gray-600 text-center">
          💡 Try it free first, mint when you love it!
        </p>
      </div>
    </div>
  )
}
