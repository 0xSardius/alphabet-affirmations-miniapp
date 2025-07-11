# Alphabet Affirmations - Implementation Plan

## 🎯 Development Workflow

### Phase 1: Component Design (v0)
Design individual UI components in isolation

### Phase 2: App Development (Cursor)  
Build complete miniapp with MiniKit integration

---

## 🏗️ Architecture Overview

### Tech Stack
```
Frontend: Next.js 14 + React + TypeScript
Styling: Tailwind CSS (black theme)
Blockchain: MiniKit + OnchainKit  
Storage: IPFS (Pinata)
Deployment: Vercel
Chain: Base
```

### Core Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0", 
    "typescript": "^5.0.0",
    "@coinbase/onchainkit": "latest",
    "@coinbase/wallet-sdk": "latest",
    "lucide-react": "latest",
    "tailwindcss": "^3.0.0"
  }
}
```

---

## 📁 File Structure

```
alphabet-affirmations/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with providers
│   │   ├── page.tsx                # Main miniapp entry point
│   │   └── globals.css             # Tailwind + custom styles
│   ├── components/
│   │   ├── ui/                     # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ProgressDots.tsx
│   │   ├── views/                  # Main view components
│   │   │   ├── HomeView.tsx
│   │   │   ├── CreateView.tsx
│   │   │   ├── LibraryView.tsx
│   │   │   └── ReaderView.tsx
│   │   ├── features/               # Feature-specific components
│   │   │   ├── AffirmationGenerator.tsx
│   │   │   ├── NFTMinter.tsx
│   │   │   ├── CollectionManager.tsx
│   │   │   └── AffirmationReader.tsx
│   │   └── layout/                 # Layout components
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Navigation.tsx
│   ├── lib/
│   │   ├── constants/
│   │   │   ├── wordBank.ts         # Curated positive words
│   │   │   ├── contracts.ts        # Smart contract addresses
│   │   │   └── config.ts           # App configuration
│   │   ├── utils/
│   │   │   ├── affirmationGenerator.ts
│   │   │   ├── nftMetadata.ts
│   │   │   └── validation.ts
│   │   ├── hooks/
│   │   │   ├── useAffirmations.ts
│   │   │   ├── useNFTCollection.ts
│   │   │   └── useMiniKit.ts
│   │   └── types/
│   │       ├── affirmation.ts
│   │       ├── nft.ts
│   │       └── user.ts
│   ├── data/
│   │   └── mockNFTs.ts             # Development data
│   └── styles/
│       └── components.css          # Component-specific styles
├── public/
│   ├── icons/
│   └── manifest.json
├── contracts/                      # Smart contract files
│   ├── AlphabetNFT.sol
│   └── deploy.js
└── docs/
    ├── API.md
    └── DEPLOYMENT.md
```

---

## 🎨 V0 Component Design Tasks

### 1. UI Components (Start Here)

#### Button Component
```typescript
// Design in v0: Black background app with white buttons
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

// Variants:
// primary: bg-white text-black (main CTA)
// secondary: border-gray-600 text-white (secondary actions)  
// ghost: text-gray-400 hover:text-white (navigation)
```

#### Input Component
```typescript
// Design in v0: Dark theme input with white text
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
}

// Style: bg-gray-900 border-gray-700 text-white
// Focus: ring-white border-transparent
```

#### Card Component  
```typescript
// Design in v0: Dark cards for content sections
interface CardProps {
  children: React.ReactNode;
  variant: 'default' | 'bordered' | 'dashed';
  padding?: 'sm' | 'md' | 'lg';
}

// Variants:
// default: bg-gray-900 border-gray-800
// bordered: border-gray-700 
// dashed: border-dashed border-gray-700
```

#### ProgressDots Component
```typescript
// Design in v0: Reading progress indicator
interface ProgressDotsProps {
  total: number;
  current: number;
}

// Style: Small white/gray dots showing reading progress
```

### 2. Feature Components

#### AffirmationCard Component
```typescript
// Design in v0: Individual affirmation display
interface AffirmationCardProps {
  letter: string;
  word: string;
  isActive?: boolean;
}

// Layout: 
// - White circle with black letter (left)
// - Large white word text (right)
// - Optional active state highlighting
```

#### NFTCollectionCard Component  
```typescript
// Design in v0: Library collection item
interface NFTCollectionCardProps {
  childName: string;
  letterCount: number;
  mintDate: string;
  onRead: () => void;
}

// Layout:
// - Child name as title
// - Subtitle with letter count and date
// - Book icon on right
// - Hover states for interactivity
```

#### ReaderPage Component
```typescript
// Design in v0: Full-screen reading experience  
interface ReaderPageProps {
  letter: string;
  word: string;
  childName: string;
  currentPage: number; // 1-26
  totalPages: number; // Always 26
}

// Layout:
// - Progress dots (1 of 26)
// - Large letter in white circle 
// - "Quinn is Amazing" in huge text
// - Navigation arrows
// - Minimal, distraction-free design for bedtime
```

### 3. V0 Design Specifications

#### Color Palette
```css
/* Primary Colors */
--bg-primary: #000000;        /* Main background */
--text-primary: #FFFFFF;      /* Main text */
--text-secondary: #9CA3AF;    /* Secondary text */

/* Component Colors */  
--bg-card: #111827;           /* Card backgrounds */
--border-default: #374151;    /* Default borders */
--border-focus: #FFFFFF;      /* Focus states */

/* Interactive Colors */
--bg-button-primary: #FFFFFF; /* Primary button */
--text-button-primary: #000000; /* Primary button text */
--bg-hover: #1F2937;          /* Hover states */
```

#### Typography Scale
```css
/* Font Families */
--font-serif: 'Playfair Display', serif;    /* Main text */
--font-sans: 'Inter', sans-serif;           /* UI elements */

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px - Footer, meta */
--text-sm: 0.875rem;   /* 14px - Labels, secondary */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Large body */
--text-xl: 1.25rem;    /* 20px - Card titles */
--text-2xl: 1.5rem;    /* 24px - Section headers */
--text-3xl: 1.875rem;  /* 30px - Page titles */
--text-4xl: 2.25rem;   /* 36px - Reading words */
```

#### Spacing System
```css
/* Consistent spacing scale */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */  
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
```

---

## ⚙️ Cursor Development Tasks

### 1. Project Setup

#### Initialize Next.js Project
```bash
# In Cursor terminal:
npx create-next-app@latest alphabet-affirmations --typescript --tailwind --eslint --app
cd alphabet-affirmations

# Install dependencies
npm install @coinbase/onchainkit @coinbase/wallet-sdk lucide-react
npm install -D @types/node
```

#### Configure Tailwind for Dark Theme
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      colors: {
        'app-black': '#000000',
        'app-gray': {
          50: '#F9FAFB',
          100: '#F3F4F6', 
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        }
      }
    },
  },
  plugins: [],
}
```

### 2. MiniKit Integration

#### Root Layout Setup
```typescript
// src/app/layout.tsx
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white font-serif">
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
        >
          {children}
        </OnchainKitProvider>
      </body>
    </html>
  );
}
```

#### MiniKit Hook Setup  
```typescript
// src/lib/hooks/useMiniKit.ts
import { useMiniKit, useClose } from '@coinbase/onchainkit/minikit';
import { useEffect } from 'react';

export function useAppMiniKit() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const close = useClose();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  return { isFrameReady, close };
}
```

### 3. Core Data Structures

#### Word Bank Implementation
```typescript
// src/lib/constants/wordBank.ts
export const WORD_BANK: Record<string, string[]> = {
  'A': ['Amazing', 'Adventurous', 'Awesome', 'Artistic', 'Affectionate', 'Ambitious'],
  'B': ['Brave', 'Brilliant', 'Beautiful', 'Beloved', 'Bright', 'Bold'],
  'C': ['Creative', 'Caring', 'Clever', 'Curious', 'Compassionate', 'Courageous'],
  // ... complete alphabet with 6+ words each
  'X': ['eXceptional', 'eXtraordinary', 'eXcellent', 'eXpressive', 'eXuberant'],
  'Y': ['Youthful', 'Yearning', 'Yes-saying', 'Yielding', 'Yummy'],
  'Z': ['Zealous', 'Zestful', 'Zen-like', 'Zippy', 'Zany', 'Zingy']
};
```

#### Type Definitions
```typescript
// src/lib/types/affirmation.ts
export interface Affirmation {
  letter: string;
  word: string;
  childName: string; // For "Quinn is Amazing" format
}

export interface AffirmationSet {
  id: string;
  childName: string;
  affirmations: Affirmation[]; // Always 26 items (A-Z)
  mintDate: string;
  tokenId?: string;
  transactionHash?: string;
}

// src/lib/types/nft.ts
export interface NFTMetadata {
  name: string;
  description: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  content: string;
}
```

### 4. Core Utilities

#### Affirmation Generator
```typescript
// src/lib/utils/affirmationGenerator.ts
import { WORD_BANK } from '../constants/wordBank';
import { Affirmation } from '../types/affirmation';

export function generateAffirmations(childName: string): Affirmation[] {
  // Always generate full alphabet (A-Z)
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  return alphabet.map(letter => {
    const words = WORD_BANK[letter] || ['Wonderful'];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    
    return {
      letter,
      word: randomWord,
      childName // Store name for "Quinn is Amazing" format
    };
  });
}

export function validateName(name: string): boolean {
  return name.trim().length > 0 && name.trim().length <= 20;
}

export function formatAffirmation(childName: string, letter: string, word: string): string {
  return `${childName} is ${word}`;
}
```

#### NFT Metadata Builder
```typescript
// src/lib/utils/nftMetadata.ts
import { NFTMetadata, AffirmationSet } from '../types';

export function buildNFTMetadata(affirmationSet: AffirmationSet): NFTMetadata {
  const affirmationText = affirmationSet.affirmations
    .map(a => `${a.letter} - ${a.childName} is ${a.word}`)
    .join('\n');

  return {
    name: `${affirmationSet.childName}'s Alphabet Affirmations`,
    description: `A complete alphabet (A-Z) of positive affirmations for ${affirmationSet.childName}. Perfect for learning ABCs while building confidence and self-esteem.`,
    attributes: [
      { trait_type: "Child Name", value: affirmationSet.childName },
      { trait_type: "Number of Letters", value: "26" }, // Always full alphabet
      { trait_type: "Creation Date", value: affirmationSet.mintDate },
      { trait_type: "Educational Tool", value: "ABC Learning + Affirmations" }
    ],
    content: affirmationText
  };
}
```

### 5. State Management

#### Affirmations Hook
```typescript
// src/lib/hooks/useAffirmations.ts
import { useState, useCallback } from 'react';
import { generateAffirmations } from '../utils/affirmationGenerator';
import { Affirmation } from '../types/affirmation';

export function useAffirmations() {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(async (name: string) => {
    setIsGenerating(true);
    
    // Add delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newAffirmations = generateAffirmations(name);
    setAffirmations(newAffirmations);
    setIsGenerating(false);
    
    return newAffirmations;
  }, []);

  const regenerate = useCallback((name: string) => {
    return generate(name);
  }, [generate]);

  return {
    affirmations,
    isGenerating,
    generate,
    regenerate
  };
}
```

### 6. Smart Contract Integration

#### Contract Configuration
```typescript
// src/lib/constants/contracts.ts
export const CONTRACTS = {
  ALPHABET_NFT: {
    address: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: [
      {
        "inputs": [
          {"name": "to", "type": "address"},
          {"name": "tokenURI", "type": "string"}
        ],
        "name": "mint",
        "outputs": [{"name": "tokenId", "type": "uint256"}],
        "stateMutability": "payable",
        "type": "function"
      }
    ] as const
  }
} as const;

export const MINT_PRICE = BigInt(5 * 10**6); // 5 USDC (6 decimals)
```

#### Minting Component
```typescript
// src/components/features/NFTMinter.tsx
import { Transaction, TransactionButton, TransactionStatus } from '@coinbase/onchainkit/transaction';
import { CONTRACTS, MINT_PRICE } from '../../lib/constants/contracts';

interface NFTMinterProps {
  metadata: string;
  onSuccess: (receipt: any) => void;
  onError: (error: any) => void;
}

export function NFTMinter({ metadata, onSuccess, onError }: NFTMinterProps) {
  return (
    <Transaction
      contracts={[{
        address: CONTRACTS.ALPHABET_NFT.address,
        abi: CONTRACTS.ALPHABET_NFT.abi,
        functionName: 'mint',
        args: [
          '0x0000000000000000000000000000000000000000', // Will be replaced with user's address
          metadata
        ],
        value: MINT_PRICE
      }]}
      onSuccess={onSuccess}
      onError={onError}
    >
      <TransactionButton
        text="Mint for $5"
        className="w-full py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100"
      />
      <TransactionStatus className="mt-4" />
    </Transaction>
  );
}
```

### 7. Main App Component

#### App Entry Point
```typescript
// src/app/page.tsx  
'use client';

import { useState } from 'react';
import { useAppMiniKit } from '../lib/hooks/useMiniKit';
import { HomeView } from '../components/views/HomeView';
import { CreateView } from '../components/views/CreateView';
import { LibraryView } from '../components/views/LibraryView';
import { ReaderView } from '../components/views/ReaderView';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

type View = 'home' | 'create' | 'library' | 'reader';

export default function AlphabetAffirmations() {
  const { isFrameReady, close } = useAppMiniKit();
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedNFT, setSelectedNFT] = useState(null);

  if (!isFrameReady) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header 
        currentView={currentView} 
        onNavigate={setCurrentView}
        onClose={close}
      />
      
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView onNavigate={setCurrentView} />
        )}
        {currentView === 'create' && (
          <CreateView onNavigate={setCurrentView} />
        )}
        {currentView === 'library' && (
          <LibraryView 
            onNavigate={setCurrentView}
            onSelectNFT={setSelectedNFT}
          />
        )}
        {currentView === 'reader' && selectedNFT && (
          <ReaderView 
            nft={selectedNFT}
            onNavigate={setCurrentView}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}
```

---

## 🚀 Development Workflow

### Phase 1: V0 Component Design (Day 1)
1. **Setup v0 project** with black theme configuration
2. **Design Button component** with 3 variants (primary, secondary, ghost)
3. **Design Input component** with dark theme styling  
4. **Design Card component** for content containers
5. **Design ProgressDots** for reading progress
6. **Design AffirmationCard** for letter + word display
7. **Design NFTCollectionCard** for library items
8. **Design ReaderPage** for full-screen reading
9. **Export all components** with proper TypeScript interfaces

### Phase 2: Cursor App Development (Day 2-3)
1. **Initialize Next.js project** with dependencies
2. **Setup MiniKit integration** with OnchainKit providers
3. **Implement word bank** and affirmation generation logic
4. **Build view components** using designed components from v0
5. **Integrate smart contract** minting functionality
6. **Add navigation** and state management
7. **Test full user flow** from creation to reading
8. **Deploy to Vercel** for testing

### Phase 3: Integration & Testing (Day 4)
1. **Deploy smart contract** to Base testnet
2. **Configure environment variables** for contract addresses
3. **Test minting flow** end-to-end
4. **Optimize performance** and loading states
5. **Add error handling** and validation
6. **Test on mobile** devices
7. **Deploy to production** on Base mainnet

---

## 🔧 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
```

---

## 📝 Development Notes

### Educational Value
- **Dual Purpose**: ABC learning + confidence building in one tool
- **Full Alphabet**: Always generates 26 affirmations regardless of name length  
- **Consistent Format**: "Quinn is Amazing" for easy reading comprehension
- **Age Appropriate**: Perfect for 2-8 year olds learning letters

### MiniKit Best Practices
- Always check `isFrameReady` before rendering main app
- Use `setFrameReady()` in useEffect to initialize
- Handle `close()` function for proper miniapp exit
- Test both in Farcaster client and standalone

### Performance Considerations  
- Lazy load components not immediately visible
- Optimize images and fonts for mobile
- Use React.memo for expensive re-renders
- Minimize bundle size with tree shaking

### Error Handling
- Network connectivity issues during minting
- Invalid wallet connections
- Smart contract failures
- IPFS upload failures

### Testing Strategy
- Unit tests for utility functions
- Component tests for UI interactions  
- Integration tests for minting flow
- Manual testing on various devices