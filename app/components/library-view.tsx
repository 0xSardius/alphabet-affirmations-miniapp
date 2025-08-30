"use client"

import { Plus } from "lucide-react"
import { Button } from "./button"
import { Card } from "./card"
import { NFTCollectionCard } from "./nft-collection-card"
import { Header } from "./header"
import { cn } from "@/lib/utils"
import { Collection } from "../../lib/storage/collections"

interface LibraryViewProps {
  collections: Collection[]
  onSelectCollection: (id: string) => void
  onCreateNew: () => void
  onBack?: () => void
  isLoading?: boolean
  className?: string
}

export function LibraryView({ collections, onSelectCollection, onCreateNew, onBack, isLoading = false, className }: LibraryViewProps) {
  return (
    <div className={cn("bg-black text-white min-h-screen", className)}>
      {/* Header */}
      <Header
        title="Your Collection"
        showBack={!!onBack}
        onBack={onBack}
      />
      
      <div className="px-6 py-8">
        <div className="mb-8">
          <p className="text-gray-400 font-sans">Personalized alphabets for your children</p>
        </div>

        {/* Collections */}
        <div className="space-y-4">
          {isLoading ? (
            /* Loading State */
            <Card className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-serif text-gray-400 mb-2">Loading your NFTs...</h3>
              <p className="text-gray-500 font-sans">Fetching collections from blockchain</p>
            </Card>
          ) : collections.length === 0 ? (
            /* Empty State */
            <Card variant="dashed" className="text-center py-12">
              <Plus className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-serif text-gray-400 mb-2">No NFTs found</h3>
              <p className="text-gray-500 font-sans mb-6">Create your first personalized alphabet NFT</p>
              <Button variant="primary" onClick={onCreateNew}>
                Create Your First
              </Button>
            </Card>
          ) : (
            collections.map((collection) => (
              <NFTCollectionCard
                key={collection.id}
                childName={collection.childName}
                letterCount={collection.letterCount}
                mintDate={collection.mintDate}
                thumbnailLetters={collection.thumbnailLetters}
                onRead={() => onSelectCollection(collection.id)}
              />
            ))
          )}
        </div>

        {/* Add New Button (if collections exist) */}
        {collections.length > 0 && (
          <div className="mt-8">
            <Button
              variant="secondary"
              size="lg"
              onClick={onCreateNew}
              className="w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Collection
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
