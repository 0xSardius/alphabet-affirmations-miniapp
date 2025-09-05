# Alphabet Affirmations - Implementation Checklist

## 🎯 Project Overview
Educational alphabet affirmations miniapp using MiniKit - teaches ABCs while building confidence through personalized affirmations for children.

## 🎉 **Current Status: Hybrid Pricing Model + Real NFT Data Integration Complete!**
- ✅ **Phase 1**: Foundation & Setup - **100% Complete**
- ✅ **Phase 2**: Core App Functionality - **100% Complete**  
- ✅ **Phase 3**: UI/UX Polish - **~95% Complete (Fixed collection card display)**
- ✅ **Phase 4**: Authentication & Data Persistence - **100% Complete**
- ✅ **Phase 5**: Hybrid Pricing Model - **100% Complete**
- ✅ **Phase 6**: Real NFT Data Integration - **100% Complete**
- 🎯 **Phase 7**: Real Blockchain Minting - **Next Priority**

---

## ✅ Phase 1: Foundation & Setup (CURRENT)

### 1.1 Project Structure
- [x] ✅ Next.js 15 project initialized
- [x] ✅ TypeScript configuration
- [x] ✅ Tailwind CSS setup
- [x] ✅ Component structure created
- [x] ✅ Basic UI components exist

### 1.2 MiniKit Integration
- [x] ✅ MiniKitProvider configured in providers.tsx
- [x] ✅ useMiniKit hook added to main page
- [x] ✅ setFrameReady() initialization
- [x] ✅ Loading state while MiniKit initializes
- [x] ✅ Error handling for MiniKit initialization

### 1.3 Core Components
- [x] ✅ All component files created
- [x] ✅ Fix import path issues (relative vs absolute)
- [x] ✅ Test all components render correctly
- [x] ✅ Verify component exports work

---

## 🔨 Phase 2: Core App Functionality (COMPLETE)

### 2.1 Affirmation Generator
- [x] ✅ Create word bank with positive words A-Z
- [x] ✅ Implement affirmation generation logic
- [x] ✅ Add name validation (2-20 characters)
- [x] ✅ Add word regeneration functionality
- [x] ✅ Add user identifier approach (FID + name for uniqueness)
- [x] ✅ Test generator with different names
- [x] ✅ Remove blurred paywall preview - go directly to full alphabet
- [x] ✅ Add unlimited reroll functionality with "Generate New Set" button
- [x] ✅ Preserve child name when rerolling for better UX
- [x] ✅ Fix randomization function for proper seed-based variation
- [x] ✅ Remove artificial delays for instant, smooth generation

### 2.2 Reading Experience
- [x] ✅ Implement page navigation (next/previous)
- [x] ✅ Clean, intuitive reading interface (no progress dots needed)
- [x] ✅ Large typography for bedtime reading
- [x] ✅ Touch-friendly navigation
- [x] ✅ Test reading flow A-Z

### 2.3 Collection Management
- [x] ✅ Local storage for created alphabets
- [x] ✅ Collection list view (LibraryView exists)
- [x] ✅ Full alphabet view with complete A-Z display
- [x] ✅ Mint NFT functionality with dialog integration
- [x] ✅ Navigation flow: Generate → Alphabet → Mint → Library
- [ ] 📝 Delete collection option (moved to Phase 2)
- [ ] 📝 Collection metadata (name, date, letter count)

### 2.4 Complete User Journey
- [x] ✅ End-to-end flow: Generate → View Full Alphabet → Reroll/Mint → Library
- [x] ✅ Removed paywall friction - users see full value immediately
- [x] ✅ Unlimited rerolls with preserved child name
- [x] ✅ Seamless minting integration with dialog
- [x] ✅ Proper navigation back to library after minting
- [x] ✅ All core user actions working: Create, Reroll, Read, Mint, Collect

---

## 🎨 Phase 3: UI/UX Polish (NEXT)

### 3.1 Design System
- [ ] 📝 Implement dark theme consistently
- [ ] 📝 Add serif fonts for warmth (Playfair Display)
- [ ] 📝 Sans fonts for UI elements (Inter)
- [ ] 📝 Consistent spacing and typography
- [ ] 📝 Mobile-first responsive design

### 3.2 Interactive States
- [x] ✅ Loading states (PreviewSkeleton, MintingDialog states)
- [x] ✅ Error states (validation, AuthFallback, MintingDialog error states)
- [ ] 📝 Success states for completed actions
- [ ] 📝 Hover and focus states for all interactive elements
- [ ] 📝 Smooth transitions and animations
- [x] ✅ Alphabet view CTA strategy: primary “Save as NFT ($5)”, secondary “Generate New Set”, tertiary “Preview Reading (A–C)”
- [x] ✅ Reader gating before mint: allow A–C preview; upsell opens mint dialog beyond C

### 3.3 Accessibility
- [ ] 📝 Keyboard navigation support
- [ ] 📝 Screen reader friendly
- [ ] 📝 High contrast for readability
- [ ] 📝 Touch targets minimum 44px
- [ ] 📝 Focus indicators visible

---

## 🔗 Phase 4: MiniKit Features

### 4.1 Authentication & User Context
- [x] ✅ Implement `useAuthenticate` hook for Farcaster sign-in
- [x] ✅ Replace hardcoded profile data with real user context
- [x] ✅ Handle authentication states (loading, error, success)
- [x] ✅ Automatic authentication on app load
- [x] ✅ Personalized experience based on user FID
- [x] ✅ Profile display in header with real data
- [x] ✅ User session management and persistence (via MiniKit context)

### 4.2 Frame Integration
- [ ] 📝 Test app loads in Farcaster clients
- [ ] 📝 Fix splash screen configuration (environment variables)
- [ ] 📝 Frame metadata optimization (.well-known/farcaster.json)
- [ ] 📝 `useAddFrame` functionality for bookmarking
- [ ] 📝 Close frame behavior with `useClose`

### 4.3 Sharing & Social
- [ ] 📝 `useComposeCast` for sharing alphabets
- [ ] 📝 Social media preview cards
- [ ] 📝 Frame embed optimization
- [ ] 📝 Test sharing flow
- [ ] 📝 `useOpenUrl` for external links

### 4.4 Backend Infrastructure (Optional - Redis for Advanced Features)
- [x] ✅ Evaluate Redis necessity → **NOT NEEDED for core app functionality**
- [ ] 📝 Set up Upstash Redis (only if adding notifications/bookmarking)
- [ ] 📝 Notification proxy at `/api/notification` (for bedtime reminders)
- [ ] 📝 Webhook handling for frame events (for `useAddFrame` bookmarking)
- [x] ✅ Data persistence strategy → **localStorage chosen for collections**

---

## 💾 Phase 5: Data Persistence & NFT Integration

### 5.1 Local Storage (Complete)
- [x] ✅ **CRITICAL**: Replace hardcoded sample collections with real localStorage
- [x] ✅ **CRITICAL**: Save generated alphabets when minting
- [x] ✅ **CRITICAL**: Load user's actual collection on app start
- [x] ✅ **CRITICAL**: Collections persist across browser sessions
- [x] ✅ **CRITICAL**: Load selected collection's affirmations properly
- [ ] 📝 Handle storage quota limits
- [ ] 📝 Data migration for updates
- [ ] 📝 Clear storage option

### 5.2 NFT Integration (Core Value Prop)
- [ ] 📝 **CRITICAL**: Replace simulated minting with real blockchain interaction
- [ ] 📝 **CRITICAL**: OnchainKit wallet connection
- [ ] 📝 **CRITICAL**: Deploy NFT contract to Base
- [ ] 📝 **CRITICAL**: $5 minting functionality
- [x] ✅ Reader unlock after mint (full A–Z)
- [ ] 📝 NFT metadata generation and IPFS storage
- [ ] 📝 Transaction error handling
- [ ] 📝 Gas estimation and transaction status

### 5.3 Cloud Storage (Future)
- [ ] 📝 Redis integration for user data
- [ ] 📝 Sync across devices
- [ ] 📝 Backup and restore
- [ ] 📝 User data privacy
- [ ] 📝 Data export functionality

---

## 🎯 Phase 6: Advanced Features (Future)

### 6.1 Smart Contract
- [ ] 📝 Deploy NFT contract to Base
- [ ] 📝 Metadata standard implementation
- [ ] 📝 Minting functionality
- [ ] 📝 Price configuration ($5 standard mint)
- [ ] 📝 Contract testing

### 6.2 Pricing Structure
- [ ] 📝 Standard mint: $5 (generated alphabet as-is)
- [ ] 📝 Custom mint: $10 (allows word customization before minting)
- [ ] 📝 Pricing display in UI
- [ ] 📝 Payment flow for both tiers

### 6.3 Wallet Integration
- [ ] 📝 OnchainKit wallet connection
- [ ] 📝 Transaction handling
- [ ] 📝 Error handling for failed transactions
- [ ] 📝 Gas estimation
- [ ] 📝 Transaction status updates

### 6.4 NFT Features
- [ ] 📝 Mint alphabet as NFT
- [ ] 📝 NFT metadata generation
- [ ] 📝 IPFS storage for metadata
- [ ] 📝 NFT collection management
- [ ] 📝 View owned NFTs
- [ ] 📝 Viewer unlock functionality (full access after minting)

---

## 🔔 Phase 7: Notifications (Future)

### 7.1 Setup
- [ ] 📝 Notification permissions
- [ ] 📝 Webhook configuration
- [ ] 📝 Redis for notification storage
- [ ] 📝 Rate limiting
- [ ] 📝 User preferences

### 7.2 Notification Types
- [ ] 📝 Bedtime reminder notifications
- [ ] 📝 New alphabet created notifications
- [ ] 📝 Milestone notifications
- [ ] 📝 Educational tips
- [ ] 📝 Notification scheduling

---

## 🚀 Phase 8: Production Deployment

### 8.1 Environment Setup
- [ ] 📝 Production environment variables
- [ ] 📝 Domain configuration
- [ ] 📝 SSL certificate
- [ ] 📝 CDN setup
- [ ] 📝 Performance optimization

### 8.2 Testing
- [ ] 📝 Cross-browser testing
- [ ] 📝 Mobile device testing
- [ ] 📝 Performance testing
- [ ] 📝 Accessibility testing
- [ ] 📝 MiniKit integration testing

### 8.3 Deployment
- [ ] 📝 Vercel deployment
- [ ] 📝 Domain setup
- [ ] 📝 Environment variables configured
- [ ] 📝 Error monitoring
- [ ] 📝 Analytics setup

---

## 🎯 Immediate Next Steps (Priority Order)

### 1. Fix Current Issues
- [ ] 🔧 **HIGH**: Fix component import errors
- [ ] 🔧 **HIGH**: Test dev server runs without errors
- [ ] 🔧 **HIGH**: Verify MiniKit initialization works

### 2. Core Functionality
- [x] ✅ **HIGH**: Implement affirmation word bank
- [ ] 📝 **HIGH**: Create alphabet generation logic
- [ ] 📝 **MEDIUM**: Add name input validation
- [ ] 📝 **MEDIUM**: Implement reading navigation

### 3. Basic UI Polish
- [ ] 📝 **MEDIUM**: Improve loading states
- [ ] 📝 **MEDIUM**: Add error handling
- [ ] 📝 **LOW**: Polish visual design
- [ ] 📝 **LOW**: Add animations

---

## 📋 Daily Development Workflow

### Each Session:
1. **Pick ONE small task** from the checklist
2. **Test the change** works correctly
3. **Update the checklist** with ✅ or notes
4. **Commit the change** with clear message
5. **Move to next task** only when current is complete

### Weekly Review:
1. Review completed tasks
2. Adjust priorities based on progress
3. Update timeline estimates
4. Plan next week's focus areas

---

## 📝 Notes & Decisions

### Technical Decisions:
- Using MiniKit from OnchainKit (not separate package)
- Relative imports for components (./components/...)
- Dark theme for bedtime reading
- Local storage for MVP, cloud storage later
- Base chain for NFT deployment

### Design Decisions:
- Serif fonts for warmth and readability
- High contrast for accessibility
- Mobile-first responsive design
- Minimal, distraction-free interface

### Future Considerations:
- Multi-language support
- Voice narration
- Custom illustrations
- Educational partnerships
- Analytics and insights

---

*Last Updated: [Current Date]*
*Next Review: [Next Review Date]* 

## 📊 **Comprehensive Codebase Review & Duplication Analysis**

### 🔍 **Current Progress Summary:**

**✅ COMPLETED (From our work today):**
- Phase 1: Foundation & Setup - **100% Complete**
- Phase 2.1: Affirmation Generator - **100% Complete**
- Phase 2.2: Reading Experience - **80% Complete** (just need testing)

---

## 🚨 **DUPLICATIVE WORK IDENTIFIED:**

### **1. ~~DUPLICATE VIEW LOGIC~~ ✅ RESOLVED**
~~**Problem:** Two separate flows for creating alphabets~~
- ✅ **FIXED:** Removed unused `"create"` view entirely
- ✅ **CLEANED:** Removed dead code (~50 lines): handlers, state, imports
- ✅ **SIMPLIFIED:** Single creation flow through `AlphabetGenerator`

### **2. UNUSED/UNDERUTILIZED COMPONENTS:**
**Problem:** v0-generated components that aren't fully integrated:

- **`PreviewSkeleton`** - Used in generator but could be better integrated
- **`AddMiniAppBanner`** - Present in state but not rendered in current flows  
- **`AuthFallback`** - Present but only conditionally shown
- **`WalletStatusChip`** - Used in MintingDialog but wallet isn't connected yet

### **3. INCONSISTENT DATA FLOW:**
**Problem:** Multiple paths for the same data:
- Sample `affirmationWords` object in page.tsx (lines 20-46)
- Word bank in `lib/data/word-bank.ts` 
- Generated affirmations state management

**Navigation Confusion:**
- `alphabet` view back button goes to `"library"` but may not have come from there
- Collection selection flow vs. generation flow have different back navigation

### **4. COLLECTION MANAGEMENT GAPS:**
**In Checklist vs. Reality:**
- Checklist shows "Collection list view" as todo
- BUT `LibraryView` component already exists and is functional
- Collections are hardcoded sample data, not from local storage

---

## 📋 **CHECKLIST ACCURACY ISSUES:**

### **Items Marked as TODO but Already Exist:**
```diff
<code_block_to_apply_changes_from>
```

### **Missing from Checklist but Built:**
- Enhanced progress indicators with letter names
- User identifier approach for unique generation
- Touch-friendly navigation improvements
- Complete affirmation context display ("Emma is Amazing")

---

## 🎯 **RECOMMENDED CLEANUP STRATEGY:**

### **High Priority Duplications to Address:**
1. ✅ ~~**Remove unused `"create"` view** entirely~~ **COMPLETED**
2. **Consolidate data flow** - use word bank consistently  
3. **Fix navigation logic** - consistent back button behavior
4. **Replace sample collections** with actual local storage

### **Medium Priority:**  
5. **Integrate unused components** or remove them
6. **Update checklist** to reflect actual state
7. **Standardize loading/error patterns**

---

## ✅ Phase 5: Hybrid Pricing Model Implementation (COMPLETE)

### 5.1 NFT Contract V2 
- [x] ✅ **CRITICAL**: Updated contract for two-tier pricing ($0.99 / $5.00)
- [x] ✅ **CRITICAL**: Added customization tracking (tier, customized letters)
- [x] ✅ **CRITICAL**: Deployed AlphabetAffirmationsNFTV2 to Base Mainnet
- [x] ✅ **CRITICAL**: Both pricing tiers tested and working
- [x] ✅ **CRITICAL**: Updated minting functions for tier selection

### 5.2 Hybrid Pricing Modal
- [x] ✅ **HIGH**: Built HybridPricingModal component (two-tier choice interface)
- [x] ✅ **HIGH**: Integrated pricing modal into alphabet view
- [x] ✅ **HIGH**: Connected modal callbacks to minting flow
- [x] ✅ **HIGH**: Added "Generate New Set" option for rerolls

### 5.3 Word Customizer Integration
- [x] ✅ **MEDIUM**: Built WordCustomizer for $5 tier
- [x] ✅ **MEDIUM**: Created CustomizationFlow interface
- [x] ✅ **MEDIUM**: Connected custom tier to WordCustomizer component
- [x] ✅ **MEDIUM**: Added customization state management

### 5.4 Modified Components for Hybrid Flow
- [x] ✅ **HIGH**: Updated MintingDialog to handle both pricing tiers
- [x] ✅ **HIGH**: Added tier selection and custom upgrade functionality
- [x] ✅ **HIGH**: Updated AlphabetGenerator with proper flow integration
- [x] ✅ **MEDIUM**: Updated app state management for hybrid pricing

---

## ✅ Phase 6: Real NFT Data Integration (COMPLETE)

### 6.1 Blockchain Data Loading
- [x] ✅ **CRITICAL**: Real NFT collection data loading from Base mainnet
- [x] ✅ **CRITICAL**: getUserNFTCollections() function working perfectly
- [x] ✅ **CRITICAL**: Contract integration with AlphabetAffirmationsNFTV2
- [x] ✅ **CRITICAL**: Automatic wallet connection via MiniKitProvider
- [x] ✅ **HIGH**: Successfully loading 9 real NFT collections from blockchain

### 6.2 Data Conversion & Display
- [x] ✅ **HIGH**: NFTCollection to Collection format conversion
- [x] ✅ **HIGH**: Real affirmation data (26 letters A-Z) displayed in reader
- [x] ✅ **HIGH**: Collection metadata (child name, mint date, tier info)
- [x] ✅ **HIGH**: Thumbnail letters properly displayed as single letters
- [x] ✅ **MEDIUM**: Fixed circular letter badge overflow issue

### 6.3 User Experience Integration
- [x] ✅ **HIGH**: Library view shows real minted NFTs (Quinn, Emma, Ashley, Leo)
- [x] ✅ **HIGH**: Reader opens real NFT data (tested with Leo's 26 affirmations)
- [x] ✅ **HIGH**: Seamless navigation between generated and minted collections
- [x] ✅ **MEDIUM**: Loading states during blockchain data fetching
- [x] ✅ **MEDIUM**: Error handling for failed NFT loading

### 6.4 Authentication & Wallet Integration
- [x] ✅ **HIGH**: Farcaster authentication working automatically
- [x] ✅ **HIGH**: Wallet connection via MiniKit (address: 0x626522B58b92dAF53596F1378bd25B7653c1fC49)
- [x] ✅ **HIGH**: User profile integration (username, avatar, FID)
- [x] ✅ **MEDIUM**: Session management and persistence

---

## 🚀 **STRATEGIC PIVOT: Hybrid Pricing Model Implementation**

**Major Strategic Change:** Moving from single $5 tier to hybrid two-tier pricing model with name-first psychology.

### **New User Flow:**
1. **Name-First Preview**: Child's letters shown prominently + teaser of others
2. **Reading Experience**: Free access to child's name letters, conversion at end
3. **Two-Tier Choice**: $0.99 random keepsake vs $5 custom keepsake
4. **Purchase Path**: Streamlined minting for each tier
5. **Success & Collection**: Encourage additional alphabets

---

## 🎯 **Hybrid Model Action Plan**

### **Phase 1: NFT Contract V2 (Priority for Sepolia)**
- [ ] 📝 **CRITICAL**: Update contract for two-tier pricing ($0.99 / $5.00)
- [ ] 📝 **CRITICAL**: Add customization tracking (tier, customized letters)
- [ ] 📝 **CRITICAL**: Deploy AlphabetAffirmationsNFTV2 to Sepolia
- [ ] 📝 **CRITICAL**: Test both pricing tiers on testnet
- [ ] 📝 **CRITICAL**: Update minting functions for tier selection

### **Phase 2: Name Extraction & Sequencing**
- [ ] 📝 **HIGH**: Build name letter extraction utility
- [ ] 📝 **HIGH**: Create name-first reader sequence logic
- [ ] 📝 **HIGH**: Update alphabet generation to separate name vs other letters
- [ ] 📝 **MEDIUM**: Add reader sequence state management

### **Phase 3: New Components (Core UX)**
- [ ] 📝 **HIGH**: Build NameFirstPreview component (replaces current alphabet view)
- [ ] 📝 **HIGH**: Create HybridPricingModal (two-tier choice interface)
- [ ] 📝 **MEDIUM**: Build WordCustomizer for $5 tier
- [ ] 📝 **MEDIUM**: Create CustomizationFlow interface

### **Phase 4: Modified Components**
- [ ] 📝 **HIGH**: Update ReaderPage for name-first sequence + conversion trigger
- [ ] 📝 **HIGH**: Modify MintingDialog to handle both pricing tiers
- [ ] 📝 **MEDIUM**: Update AlphabetGenerator with name extraction
- [ ] 📝 **LOW**: Update ProgressDots to show unlocked/locked states

### **Phase 5: State Management Overhaul**
- [ ] 📝 **HIGH**: Add hybrid app state (name letters, reader sequence, pricing tier)
- [ ] 📝 **HIGH**: Implement conversion trigger logic
- [ ] 📝 **MEDIUM**: Add customization state management
- [ ] 📝 **LOW**: Update view state machine for new flow

---

## 🚀 **Previous Priority: Real NFT Minting (Updated)**

**What's Complete Now:**
- ✅ **Real user authentication** with Farcaster
- ✅ **Real data persistence** with localStorage  
- ✅ **Seamless user experience** with instant generation
- ✅ **Full app functionality** - create, reroll, read, save collections

**Current Status - What's Working:**
- ✅ **NFT contract V2 deployed** - Two-tier pricing structure on Base mainnet
- ✅ **Hybrid pricing modal** - $0.99 vs $5 choice interface working
- ✅ **Real blockchain data loading** - 9 NFT collections loaded successfully
- ✅ **Customization interface** - WordCustomizer integrated for $5 tier
- ✅ **Wallet connection** - MiniKit automatically connects user wallet
- ✅ **Collection display** - Fixed circular badge overflow, real data shown

**Remaining Critical Gaps:**
- ❌ **Real blockchain minting** - Still simulated, needs OnchainKit Transaction component
- ❌ **Name-first user flow** - Child's letters prominent preview (optional enhancement)
- ❌ **Transaction error handling** - Robust error states for failed mints

**Next Steps Priority:**
1. **Implement real blockchain minting** - Replace simulated minting with OnchainKit Transaction
2. **Test minting flow end-to-end** - Both $0.99 and $5.00 tiers on Base mainnet  
3. **Add transaction error handling** - Handle failed transactions gracefully
4. **Optional: Name-first preview** - Show child's letters prominently before full alphabet

---

## 🎯 Phase 7: Real Blockchain Minting (CURRENT PRIORITY)

### 7.1 OnchainKit Transaction Integration
- [ ] 📝 **CRITICAL**: Replace simulated minting with OnchainKit Transaction component
- [ ] 📝 **CRITICAL**: Configure Transaction component for both pricing tiers ($0.99 / $5.00)
- [ ] 📝 **CRITICAL**: Connect to AlphabetAffirmationsNFTV2 contract on Base mainnet
- [ ] 📝 **HIGH**: Add proper transaction parameters (childName, words array, tier, etc.)

### 7.2 Minting Flow Integration
- [ ] 📝 **HIGH**: Update MintingDialog to use real transactions instead of simulation
- [ ] 📝 **HIGH**: Handle transaction success/failure states properly
- [ ] 📝 **HIGH**: Refresh NFT collection data after successful mint
- [ ] 📝 **MEDIUM**: Add transaction hash display and Base block explorer links

### 7.3 Error Handling & UX
- [ ] 📝 **HIGH**: Robust error handling for failed transactions
- [ ] 📝 **HIGH**: User-friendly error messages for common failures
- [ ] 📝 **MEDIUM**: Gas estimation and transaction preview
- [ ] 📝 **MEDIUM**: Loading states during transaction processing

### 7.4 Testing & Validation
- [ ] 📝 **CRITICAL**: Test $0.99 random tier minting end-to-end
- [ ] 📝 **CRITICAL**: Test $5.00 custom tier minting end-to-end  
- [ ] 📝 **HIGH**: Verify minted NFTs appear in library immediately
- [ ] 📝 **HIGH**: Test transaction failures and error recovery

---

## 🚀 **Phase 8: Gamification & Engagement System (Post-MVP)**

### **8.1 Point System & Rewards**
- [ ] 📝 **HIGH**: Reading streak tracking (daily consistency rewards)
- [ ] 📝 **HIGH**: Point system for completing full alphabet readings
- [ ] 📝 **HIGH**: Bonus points for reading with different children
- [ ] 📝 **MEDIUM**: Achievement badges (7-day streak, 30-day streak, etc.)
- [ ] 📝 **MEDIUM**: Weekly/monthly reading challenges
- [ ] 📝 **LOW**: Leaderboards for family members

### **8.2 Consistency Tracking**
- [ ] 📝 **HIGH**: Reading session analytics (time spent, letters completed)
- [ ] 📝 **HIGH**: Calendar view showing reading history
- [ ] 📝 **HIGH**: Streak counter with visual progress indicators
- [ ] 📝 **MEDIUM**: Reading time recommendations (bedtime routine integration)
- [ ] 📝 **MEDIUM**: Parent dashboard showing child's progress over time
- [ ] 📝 **LOW**: Reading insights and personalized tips

### **8.3 Habit Formation Features**
- [ ] 📝 **HIGH**: Daily reading reminders (push notifications)
- [ ] 📝 **HIGH**: Reading goal setting (e.g., "Read 3 times this week")
- [ ] 📝 **MEDIUM**: Bedtime routine integration with time-based suggestions
- [ ] 📝 **MEDIUM**: Reading session duration tracking
- [ ] 📝 **LOW**: Integration with family calendar apps

### **8.4 Social & Sharing Enhancements**
- [ ] 📝 **MEDIUM**: Share reading streaks to Farcaster
- [ ] 📝 **MEDIUM**: Family reading challenges (multiple parents/children)
- [ ] 📝 **MEDIUM**: Reading milestone celebrations with automatic sharing
- [ ] 📝 **LOW**: Community reading challenges

### **8.5 Data Storage & Analytics**
- [ ] 📝 **HIGH**: Redis-based session tracking and point storage
- [ ] 📝 **HIGH**: User reading patterns and consistency metrics
- [ ] 📝 **MEDIUM**: Export reading data for parents
- [ ] 📝 **MEDIUM**: Privacy-compliant analytics dashboard
- [ ] 📝 **LOW**: Reading effectiveness insights (which words/letters are favorites)

---

## 🚀 **Phase 9: Advanced Features (Future)**

### **Collection Management Enhancements**
- [ ] 📝 Add delete button for collection view
- [ ] 📝 Collection sorting options (date, name, etc.)
- [ ] 📝 Search/filter collections
- [ ] 📝 Bulk collection actions

### **Advanced Features**  
- [ ] 📝 Custom word editing interface ($10 mint tier)
- [ ] 📝 Word customization flow and validation
- [ ] 📝 Multiple alphabet themes/styles
- [ ] 📝 Audio recordings of affirmations
- [ ] 📝 Sharing individual letters vs full alphabets
- [ ] 📝 Family sharing between parents

### **Business Features**
- [ ] 📝 Usage analytics and insights
- [ ] 📝 Pricing experimentation tools
- [ ] 📝 Referral/invite system 