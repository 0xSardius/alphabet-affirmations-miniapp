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
    "@coinbase/minikit": "latest",
    "lucide-react": "latest",
    "tailwindcss": "^3.0.0",
    "@upstash/redis": "^1.20.0",
    "@upstash/ratelimit": "^0.4.0"
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
│   │   │   ├── minikit.ts          # MiniKit configuration
│   │   │   └── config.ts           # App configuration
│   │   ├── utils/
│   │   │   ├── affirmationGenerator.ts
│   │   │   ├── nftMetadata.ts
│   │   │   ├── redis.ts            # Upstash Redis client
│   │   │   ├── notifications.ts    # Notification helpers
│   │   │   └── validation.ts
│   │   ├── hooks/
│   │   │   ├── useAffirmations.ts
│   │   │   ├── useNFTCollection.ts
│   │   │   ├── useMiniKit.ts
│   │   │   ├── useNotifications.ts # Notification management
│   │   │   └── useAnalytics.ts     # Redis-based analytics
│   │   └── types/
│   │       ├── affirmation.ts
│   │       ├── nft.ts
│   │       ├── analytics.ts        # Analytics types
│   │       ├── notifications.ts    # Notification types
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
npm install @coinbase/onchainkit @coinbase/wallet-sdk @coinbase/minikit lucide-react
npm install @upstash/redis @upstash/ratelimit
npm install -D @types/node

# Setup MiniKit App Registration
# 1. Go to https://www.coinbase.com/developer-platform
# 2. Create new MiniApp project
# 3. Configure app details (name, description, icon, screenshots)
# 4. Copy App ID to .env.local as NEXT_PUBLIC_MINIKIT_APP_ID
# 5. Set callback URLs and permissions

# Setup Upstash Redis (run in project root)
# 1. Sign up at https://console.upstash.com
# 2. Create a new Redis database
# 3. Copy REST URL and token to .env.local

# Create required static assets
mkdir -p public/icons public/screenshots
# Add app-icon.png (512x512) to public/icons/
# Add screenshot images to public/screenshots/
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

### 2. MiniKit Configuration

#### MiniKit Constants
```typescript
// src/lib/constants/minikit.ts
export const MINIKIT_CONFIG = {
  appName: 'Alphabet Affirmations',
  appId: process.env.NEXT_PUBLIC_MINIKIT_APP_ID!,
  appUrl: process.env.NEXT_PUBLIC_APP_URL!,
  iconUrl: `${process.env.NEXT_PUBLIC_APP_URL}/icons/app-icon.png`,
  description: 'Educational alphabet affirmations that teach ABCs while building confidence',
  permissions: [
    'notifications',
    'wallet',
    'identity'
  ],
  categories: ['education', 'family', 'children'],
  screenshots: [
    `${process.env.NEXT_PUBLIC_APP_URL}/screenshots/home.png`,
    `${process.env.NEXT_PUBLIC_APP_URL}/screenshots/reader.png`,
    `${process.env.NEXT_PUBLIC_APP_URL}/screenshots/library.png`
  ]
};

export const NOTIFICATION_TYPES = {
  BEDTIME_REMINDER: 'bedtime_reminder',
  ALPHABET_MILESTONE: 'alphabet_milestone',
  NEW_FEATURES: 'new_features',
  EDUCATIONAL_TIP: 'educational_tip'
} as const;
```

#### Add MiniApp Component
```typescript
// src/components/features/AddMiniApp.tsx
import { useAddMiniApp } from '@coinbase/minikit';
import { Plus, Bookmark } from 'lucide-react';
import { MINIKIT_CONFIG } from '../../lib/constants/minikit';

export function AddMiniAppButton() {
  const { addMiniApp, isAdded, isLoading } = useAddMiniApp();

  const handleAddMiniApp = async () => {
    try {
      await addMiniApp({
        name: MINIKIT_CONFIG.appName,
        iconUrl: MINIKIT_CONFIG.iconUrl,
        url: MINIKIT_CONFIG.appUrl,
        description: MINIKIT_CONFIG.description
      });
    } catch (error) {
      console.error('Failed to add miniapp:', error);
    }
  };

  if (isAdded) {
    return (
      <div className="flex items-center space-x-2 text-green-400 text-sm">
        <Bookmark className="w-4 h-4" />
        <span>Added to your apps</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleAddMiniApp}
      disabled={isLoading}
      className="flex items-center space-x-2 px-3 py-2 border border-gray-600 rounded-lg text-sm hover:border-gray-400 disabled:opacity-50"
    >
      <Plus className="w-4 h-4" />
      <span>{isLoading ? 'Adding...' : 'Add to Apps'}</span>
    </button>
  );
}
```

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

### 3. MiniKit Integration

#### Root Layout Setup
```typescript
// src/app/layout.tsx
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { MiniKitProvider } from '@coinbase/minikit';
import { base } from 'wagmi/chains';
import { MINIKIT_CONFIG } from '../lib/constants/minikit';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="minikit:config" content={JSON.stringify(MINIKIT_CONFIG)} />
      </head>
      <body className="bg-black text-white font-serif">
        <MiniKitProvider
          appId={MINIKIT_CONFIG.appId}
          appName={MINIKIT_CONFIG.appName}
          iconUrl={MINIKIT_CONFIG.iconUrl}
          permissions={MINIKIT_CONFIG.permissions}
        >
          <OnchainKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
            chain={base}
          >
            {children}
          </OnchainKitProvider>
        </MiniKitProvider>
      </body>
    </html>
  );
}
```

#### Enhanced MiniKit Hook
```typescript
// src/lib/hooks/useMiniKit.ts
import { useMiniKit, useClose, useAddMiniApp } from '@coinbase/minikit';
import { useNotifications } from './useNotifications';
import { useEffect, useState } from 'react';

export function useAppMiniKit() {
  const { setFrameReady, isFrameReady, user } = useMiniKit();
  const close = useClose();
  const { addMiniApp, isAdded } = useAddMiniApp();
  const { requestPermission, scheduleNotification } = useNotifications();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isFrameReady && !isInitialized) {
      setFrameReady();
      setIsInitialized(true);
    }
  }, [isFrameReady, setFrameReady, isInitialized]);

  // Auto-request notification permission after first successful mint
  const handleFirstMint = async (childName: string) => {
    try {
      const hasPermission = await requestPermission();
      if (hasPermission) {
        // Schedule bedtime reminder
        await scheduleNotification({
          type: 'bedtime_reminder',
          title: `Time for ${childName}'s alphabet!`,
          body: `Ready to practice ABCs with ${childName}?`,
          scheduledTime: getBedtimeHour(), // 7 PM default
          recurring: 'daily'
        });
      }
    } catch (error) {
      console.error('Failed to setup notifications:', error);
    }
  };

  return { 
    isFrameReady, 
    close, 
    user,
    addMiniApp,
    isAdded,
    handleFirstMint
  };
}

function getBedtimeHour(): Date {
  const now = new Date();
  const bedtime = new Date(now);
  bedtime.setHours(19, 0, 0, 0); // 7 PM
  
  // If it's already past 7 PM today, schedule for tomorrow
  if (now.getHours() >= 19) {
    bedtime.setDate(bedtime.getDate() + 1);
  }
  
  return bedtime;
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

### 4. Notification System

#### Notification Types
```typescript
// src/lib/types/notifications.ts
export interface NotificationConfig {
  type: string;
  title: string;
  body: string;
  scheduledTime?: Date;
  recurring?: 'daily' | 'weekly' | 'none';
  data?: Record<string, any>;
}

export interface NotificationPreferences {
  bedtimeReminders: boolean;
  educationalTips: boolean;
  milestones: boolean;
  newFeatures: boolean;
  reminderTime: string; // "19:00" format
}
```

#### Notification Utilities
```typescript
// src/lib/utils/notifications.ts
import { redis } from './redis';
import { NotificationConfig } from '../types/notifications';

export class NotificationManager {
  private static instance: NotificationManager;
  
  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async scheduleNotification(userId: string, config: NotificationConfig) {
    const notificationId = `${userId}_${config.type}_${Date.now()}`;
    
    // Store in Redis with TTL based on scheduled time
    const ttl = config.scheduledTime 
      ? Math.max(0, Math.floor((config.scheduledTime.getTime() - Date.now()) / 1000))
      : 3600; // Default 1 hour

    await redis.setex(
      `notification:${notificationId}`,
      ttl,
      JSON.stringify(config)
    );

    // Add to user's notification queue
    await redis.lpush(`notifications:${userId}`, notificationId);

    return notificationId;
  }

  async getNotificationPreferences(userId: string) {
    const prefs = await redis.get(`preferences:${userId}`);
    return prefs ? JSON.parse(prefs as string) : this.getDefaultPreferences();
  }

  async updateNotificationPreferences(userId: string, preferences: any) {
    await redis.set(`preferences:${userId}`, JSON.stringify(preferences));
  }

  private getDefaultPreferences() {
    return {
      bedtimeReminders: true,
      educationalTips: true,
      milestones: true,
      newFeatures: false,
      reminderTime: "19:00"
    };
  }

  // Educational notification templates
  getBedtimeReminderTemplate(childName: string): NotificationConfig {
    return {
      type: 'bedtime_reminder',
      title: `📚 ${childName}'s Alphabet Time!`,
      body: `Ready to practice ABCs and build confidence with ${childName}?`,
      data: { childName, action: 'open_reader' }
    };
  }

  getMilestoneTemplate(childName: string, milestone: string): NotificationConfig {
    return {
      type: 'alphabet_milestone',
      title: `🌟 Amazing Progress!`,
      body: `${childName} has ${milestone}! Keep up the great learning.`,
      data: { childName, milestone }
    };
  }

  getEducationalTipTemplate(): NotificationConfig {
    const tips = [
      "Reading aloud helps children connect sounds to letters!",
      "Positive affirmations boost learning confidence by 40%",
      "Bedtime reading creates stronger parent-child bonds",
      "Repetition is key - the same alphabet book 5+ times builds mastery"
    ];
    
    const tip = tips[Math.floor(Math.random() * tips.length)];
    
    return {
      type: 'educational_tip',
      title: `💡 Learning Tip`,
      body: tip,
      data: { category: 'educational' }
    };
  }
}
```

#### Notification Hook
```typescript
// src/lib/hooks/useNotifications.ts
import { useState, useCallback } from 'react';
import { useRequestNotificationPermission, useSendNotification } from '@coinbase/minikit';
import { NotificationManager } from '../utils/notifications';
import { useAppMiniKit } from './useMiniKit';

export function useNotifications() {
  const { user } = useAppMiniKit();
  const requestPermission = useRequestNotificationPermission();
  const sendNotification = useSendNotification();
  const [hasPermission, setHasPermission] = useState(false);

  const notificationManager = NotificationManager.getInstance();

  const requestNotificationPermission = useCallback(async () => {
    try {
      const granted = await requestPermission();
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Notification permission denied:', error);
      return false;
    }
  }, [requestPermission]);

  const scheduleNotification = useCallback(async (config: any) => {
    if (!user?.id || !hasPermission) return null;

    try {
      const notificationId = await notificationManager.scheduleNotification(
        user.id,
        config
      );
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }, [user?.id, hasPermission, notificationManager]);

  const sendImmediateNotification = useCallback(async (config: any) => {
    if (!hasPermission) return false;

    try {
      await sendNotification({
        title: config.title,
        body: config.body,
        data: config.data
      });
      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }, [hasPermission, sendNotification]);

  const scheduleBedtimeReminder = useCallback(async (childName: string) => {
    const template = notificationManager.getBedtimeReminderTemplate(childName);
    const bedtimeHour = new Date();
    bedtimeHour.setHours(19, 0, 0, 0); // 7 PM
    
    if (bedtimeHour <= new Date()) {
      bedtimeHour.setDate(bedtimeHour.getDate() + 1);
    }
    
    return await scheduleNotification({
      ...template,
      scheduledTime: bedtimeHour,
      recurring: 'daily'
    });
  }, [scheduleNotification, notificationManager]);

  const sendMilestoneNotification = useCallback(async (childName: string, milestone: string) => {
    const template = notificationManager.getMilestoneTemplate(childName, milestone);
    return await sendImmediateNotification(template);
  }, [sendImmediateNotification, notificationManager]);

  return {
    hasPermission,
    requestPermission: requestNotificationPermission,
    scheduleNotification,
    sendImmediateNotification,
    scheduleBedtimeReminder,
    sendMilestoneNotification
  };
}
```

#### Redis Client Setup
```typescript
// src/lib/utils/redis.ts
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiting for generation requests
export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 requests per minute
  analytics: true,
});

// Session management
export async function saveSession(sessionId: string, data: any) {
  await redis.setex(`session:${sessionId}`, 3600, JSON.stringify(data)); // 1 hour TTL
}

export async function getSession(sessionId: string) {
  const data = await redis.get(`session:${sessionId}`);
  return data ? JSON.parse(data as string) : null;
}

// Analytics tracking
export async function trackEvent(event: string, metadata?: any) {
  const timestamp = Date.now();
  await redis.zadd(`events:${event}`, timestamp, JSON.stringify({ timestamp, ...metadata }));
}

// Cache generated affirmations temporarily
export async function cacheAffirmations(childName: string, affirmations: any[]) {
  const key = `affirmations:${childName.toLowerCase()}`;
  await redis.setex(key, 300, JSON.stringify(affirmations)); // 5 minutes cache
}

export async function getCachedAffirmations(childName: string) {
  const key = `affirmations:${childName.toLowerCase()}`;
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached as string) : null;
}
```

#### Analytics Hook
```typescript
// src/lib/hooks/useAnalytics.ts
import { useCallback } from 'react';
import { trackEvent } from '../utils/redis';

export function useAnalytics() {
  const track = useCallback(async (event: string, metadata?: any) => {
    try {
      await trackEvent(event, metadata);
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }, []);

  return { track };
}

// Usage in components:
// const { track } = useAnalytics();
// track('affirmation_generated', { childName: name, letterCount: 26 });
// track('nft_minted', { childName: name, transactionHash: hash });
// track('reading_completed', { childName: name, timeSpent: duration });
```

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

### 7. State Management

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

### 8. Quick Auth Implementation

#### Auth Context Provider
```typescript
// src/lib/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useAppMiniKit } from '../hooks/useMiniKit';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  farcasterProfile: any | null;
}

interface AuthContextType extends AuthState {
  login: () => Promise<boolean>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, authenticateUser, isFrameReady } = useAppMiniKit();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    farcasterProfile: null
  });

  // Quick auth: Automatically authenticate when frame is ready
  useEffect(() => {
    if (isFrameReady && user) {
      handleQuickAuth();
    }
  }, [isFrameReady, user]);

  const handleQuickAuth = async () => {
    try {
      const authenticatedUser = await authenticateUser();
      if (authenticatedUser) {
        setAuthState({
          user: authenticatedUser,
          isAuthenticated: true,
          isLoading: false,
          farcasterProfile: user
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Quick auth failed:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    return await handleQuickAuth();
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      farcasterProfile: null
    });
  };

  const refreshProfile = async () => {
    if (authState.isAuthenticated) {
      await handleQuickAuth();
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

#### Quick Auth API Route
```typescript
// src/app/api/auth/route.ts - For frame authentication
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '../../../lib/utils/redis';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fid, timestamp, signature } = body;

    // Verify the authentication request
    if (!fid || !timestamp || !signature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Store authentication session
    const sessionId = `auth_${fid}_${timestamp}`;
    await redis.setex(sessionId, 3600, JSON.stringify({
      fid,
      timestamp,
      authenticated: true
    }));

    // Track authentication event
    await redis.zadd('events:auth', Date.now(), JSON.stringify({
      fid,
      timestamp: Date.now(),
      method: 'quick_auth'
    }));

    return NextResponse.json({ 
      success: true, 
      sessionId,
      redirectUrl: process.env.NEXT_PUBLIC_APP_URL 
    });

  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
```

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

### 10. Main App Component

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
2. **Setup MiniKit integration** with app registration and permissions
3. **Configure notification system** with Redis backend
4. **Implement word bank** and affirmation generation logic
5. **Build view components** using designed components from v0
6. **Integrate smart contract** minting functionality
7. **Add navigation** and state management with notifications
8. **Implement Add MiniApp** functionality and notification preferences
9. **Test full user flow** from creation to reading with notifications
10. **Deploy to Vercel** for testing

### Phase 3: Integration & Testing (Day 4)
1. **Deploy smart contract** to Base testnet
2. **Register MiniApp** with Coinbase Developer Platform
3. **Configure notification permissions** and test notification flow
4. **Test minting flow** end-to-end with add miniapp functionality
5. **Optimize performance** and loading states
6. **Add error handling** and validation for notifications
7. **Test on mobile** devices within Farcaster app
8. **Submit MiniApp** for review and approval
9. **Deploy to production** on Base mainnet

---

## 🔧 Environment Variables

```bash
# .env.local

# OnchainKit & Blockchain
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# MiniKit Configuration
NEXT_PUBLIC_MINIKIT_APP_ID=your_minikit_app_id
NEXT_PUBLIC_APP_URL=https://your-app-domain.vercel.app
NEXT_PUBLIC_APP_NAME="Alphabet Affirmations"
```

---

## 📝 Development Notes

### Quick Auth Best Practices (Farcaster Guidelines)
- **No external wallet required**: Use Farcaster's built-in identity and wallet
- **Automatic authentication**: Authenticate users when frame loads without additional steps
- **Respect user privacy**: Only request necessary permissions (notifications, wallet for minting)
- **Frame-based auth**: Support authentication through frame interactions
- **Graceful fallbacks**: Handle cases where quick auth isn't available
- **Session management**: Use Redis to store temporary auth sessions
- **FID-based identity**: Use Farcaster ID (FID) as primary user identifier

### Farcaster-Specific Considerations
- **Frame compatibility**: Ensure app works both as miniapp and in frame context
- **Mobile optimization**: Design for Farcaster mobile app experience
- **Deep linking**: Support opening specific views from Farcaster casts
- **Share integration**: Easy sharing back to Farcaster with educational achievements
- **Profile integration**: Display Farcaster username/avatar when appropriate

### MiniKit-Specific Considerations
- **App Registration**: Must register with Coinbase Developer Platform before deployment
- **Icon Requirements**: 512x512px PNG icon for app listing
- **Screenshot Requirements**: Multiple screenshots showing key flows
- **Permission Declarations**: Explicitly request notifications, wallet, identity permissions
- **Notification Limits**: Respect user preferences and platform limits
- **Add MiniApp UX**: Prominently feature Add to Apps button for discovery
- **App Store Guidelines**: Follow Coinbase MiniApp store submission guidelines

### Educational Value
- **Dual Purpose**: ABC learning + confidence building in one tool
- **Full Alphabet**: Always generates 26 affirmations regardless of name length  
- **Consistent Format**: "Quinn is Amazing" for easy reading comprehension
- **Age Appropriate**: Perfect for 2-8 year olds learning letters

### Upstash Redis Benefits
- **Serverless**: Perfect for Vercel deployment with no connection management
- **Fast**: In-memory caching for generated affirmations and sessions
- **Rate Limiting**: Built-in protection against abuse
- **Analytics**: Real-time tracking of user engagement and learning progress
- **Session Management**: Temporary storage during creation flow
- **Cost Effective**: Pay-per-request pricing scales with usage

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