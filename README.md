# 🎯 Alphabet Affirmations MiniApp

> **Create personalized alphabet affirmations for your child and mint them as NFTs on Base**

A Farcaster MiniApp that generates beautiful, personalized alphabet affirmations like "Emma is Amazing, Brilliant, Creative..." and lets parents mint them as permanent keepsakes on the blockchain.

## ✨ What It Does

**For Parents:**
- Generate personalized A-Z affirmations for your child
- Choose between random ($0.99) or custom ($5.00) word selections
- Mint as NFTs on Base for permanent keepsake value
- Read affirmations together as interactive bedtime stories
- Share your child's alphabet with the Farcaster community

**For Children:**
- See their name in beautiful, positive affirmations
- Learn letters through personalized, meaningful words
- Build confidence with daily positive reinforcement
- Create lasting memories with parents

## 🚀 Live Demo

Try it now on Farcaster: [Alphabet Affirmations MiniApp](https://your-domain.com)

## 🎯 Key Features

### 🔮 **Smart Generation**
- Deterministic word generation based on child's name + Farcaster ID
- Consistent results - same name always gets same words
- Reroll functionality for trying different combinations

### 💎 **Two-Tier Pricing**
- **Random Tier ($0.99)**: Get a beautiful random alphabet
- **Custom Tier ($5.00)**: Personalize specific words for your child

### 🎨 **Beautiful UI/UX**
- Clean, mobile-first design optimized for Farcaster
- Interactive reading experience with letter-by-letter reveal
- Smooth animations and micro-interactions

### ⛓️ **Real Blockchain Integration**
- Mint NFTs on Base mainnet using real ETH
- Load existing collections from your wallet
- Permanent ownership and transferability

### 📚 **Reading Experience**
- Interactive story mode for bedtime reading
- Progress tracking through the alphabet
- Shareable moments and milestones

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations

### **Blockchain**
- **Base (Ethereum L2)** - Low-cost, fast transactions
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript Ethereum library
- **Custom NFT Contract** - AlphabetAffirmationsNFTV2

### **Farcaster Integration**
- **MiniKit** - Farcaster MiniApp framework
- **OnchainKit** - Coinbase's Web3 toolkit
- **Farcaster Auth** - Seamless user authentication

### **Infrastructure**
- **Vercel** - Deployment and hosting
- **Redis** - Caching and session management
- **IPFS** - Decentralized metadata storage

## 📁 Project Structure

```
alphabet-affirmations-miniapp/
├── app/                          # Next.js App Router
│   ├── components/               # React components
│   │   ├── alphabet-generator.tsx
│   │   ├── hybrid-pricing-modal.tsx
│   │   ├── word-customizer.tsx
│   │   ├── minting-dialog.tsx
│   │   └── ...
│   ├── api/                      # API routes
│   │   ├── notify/
│   │   └── webhook/
│   └── documentation/            # Project docs
├── lib/                          # Utilities and data
│   ├── data/word-bank.ts        # Affirmation words
│   ├── contracts/               # Smart contract ABIs
│   ├── constants/               # App constants
│   └── utils/                   # Helper functions
├── contracts/                    # Smart contracts (Foundry)
│   ├── src/AlphabetAffirmationsNFTV2.sol
│   └── script/                  # Deploy scripts
└── public/                      # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Farcaster account for testing

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/alphabet-affirmations-miniapp
   cd alphabet-affirmations-miniapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   NEXT_PUBLIC_MINIKIT_PROJECT_ID=your_minikit_project_id
   REDIS_URL=your_redis_url
   NEYNAR_API_KEY=your_neynar_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in Farcaster**
   - Use a Farcaster client that supports MiniApps
   - Navigate to `http://localhost:3000`

## 🔧 Smart Contract

The NFT contract (`AlphabetAffirmationsNFTV2`) supports:
- Two-tier pricing (random vs custom)
- Customization tracking
- Metadata storage
- Standard ERC-721 functionality

### Contract Addresses
- **Base Mainnet**: `0x...` (deployed)
- **Base Sepolia**: `0x...` (testnet)

## 📊 Usage Analytics

Track key metrics:
- Alphabets generated
- NFTs minted by tier
- User engagement and retention
- Revenue by pricing tier

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Farcaster** - For the amazing MiniApp platform
- **Base** - For low-cost, fast blockchain infrastructure
- **OnchainKit** - For seamless Web3 integration
- **Parents everywhere** - For inspiring positive affirmations for children

## 📞 Support

- **Documentation**: Check `/app/documentation/` for detailed guides
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Community**: Join the discussion on Farcaster

---

**Built with ❤️ for parents who want to create lasting, positive memories with their children.**