# AlphabetAffirmationsNFTV2 - Base Sepolia Deployment Guide

## 🎯 Overview
Deploy the V2 contract with hybrid pricing ($0.99 + $5 tiers) to Base Sepolia testnet for testing.

## 🔧 Prerequisites

### 1. Environment Variables
Create a `.env` file in the `contracts/` directory:

```bash
# Base Sepolia RPC (Alchemy/Infura)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
# Alternative: https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Your private key (NEVER commit this)
PRIVATE_KEY=0x1234567890abcdef...

# BaseScan API key for verification (optional but recommended)
BASESCAN_API_KEY=your_basescan_api_key_here

# Base Sepolia Chain ID (for verification)
CHAIN_ID=84532
```

### 2. Get Base Sepolia ETH
Get testnet ETH for deployment:
- **Base Sepolia Faucet**: https://bridge.base.org/deposit
- **Alternative**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- You need ~0.01 ETH for deployment + gas

### 3. Verify Foundry Setup
```bash
cd contracts
forge --version  # Should show foundry version
```

## 🚀 Deployment Commands

### Step 1: Test Locally First
```bash
# Run all V2 contract tests
forge test --match-contract AlphabetAffirmationsV2Test -vv

# Run specific test
forge test --match-test testRandomTierMinting -vv

# Check gas estimates
forge test --gas-report
```

### Step 2: Compile Contract
```bash
# Compile all contracts
forge build

# Check for any compilation errors
forge build --sizes
```

### Step 3: Deploy to Base Sepolia
```bash
# Deploy with verification
forge script script/AlphabetAffirmationsV2DeployScript.s.sol:AlphabetAffirmationsV2DeployScript \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY \
  -vvvv

# Deploy without verification (faster)
forge script script/AlphabetAffirmationsV2DeployScript.s.sol:AlphabetAffirmationsV2DeployScript \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  -vv
```

### Step 4: Verify Contract (if not done during deployment)
```bash
# Manual verification
forge verify-contract \
  --chain-id 84532 \
  --num-of-optimizations 200 \
  --watch \
  --etherscan-api-key $BASESCAN_API_KEY \
  CONTRACT_ADDRESS \
  src/AlphabetAffirmationsNFTV2.sol:AlphabetAffirmationsNFTV2
```

## 🧪 Testing Deployed Contract

### Using Cast (Foundry CLI)
```bash
# Check contract deployment
cast code CONTRACT_ADDRESS --rpc-url $BASE_SEPOLIA_RPC_URL

# Check pricing constants
cast call CONTRACT_ADDRESS "RANDOM_PRICE()" --rpc-url $BASE_SEPOLIA_RPC_URL
cast call CONTRACT_ADDRESS "CUSTOM_PRICE()" --rpc-url $BASE_SEPOLIA_RPC_URL

# Check total supply
cast call CONTRACT_ADDRESS "totalSupply()" --rpc-url $BASE_SEPOLIA_RPC_URL

# Check contract owner
cast call CONTRACT_ADDRESS "owner()" --rpc-url $BASE_SEPOLIA_RPC_URL
```

### Test Minting (Random Tier - $0.99)
```bash
# Mint random tier NFT
cast send CONTRACT_ADDRESS \
  "mintAlphabet(string,string[26],string,uint8,string[],string)" \
  "Emma" \
  '["Amazing","Brave","Creative","Determined","Energetic","Friendly","Generous","Happy","Intelligent","Joyful","Kind","Loving","Magnificent","Nice","Outstanding","Positive","Quick","Remarkable","Strong","Talented","Unique","Valuable","Wonderful","eXtraordinary","Young","Zealous"]' \
  "ipfs://QmTest123" \
  0 \
  '[]' \
  "EMMA" \
  --value 0.0003ether \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC_URL
```

### Test Minting (Custom Tier - $5.00)
```bash
# Mint custom tier NFT
cast send CONTRACT_ADDRESS \
  "mintAlphabet(string,string[26],string,uint8,string[],string)" \
  "Quinn" \
  '["Amazing","Brave","Creative","Determined","Energetic","Friendly","Generous","Happy","Intelligent","Joyful","Kind","Loving","Magnificent","Nice","Outstanding","Positive","Quick","Remarkable","Strong","Talented","Unique","Valuable","Wonderful","eXtraordinary","Young","Zealous"]' \
  "ipfs://QmTest456" \
  1 \
  '["A","E","Q"]' \
  "QUINN" \
  --value 0.0015ether \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC_URL
```

### Check Analytics
```bash
# Get analytics data
cast call CONTRACT_ADDRESS "getAnalytics()" --rpc-url $BASE_SEPOLIA_RPC_URL

# Check user mint count
cast call CONTRACT_ADDRESS "getUserMintCount(address)" YOUR_ADDRESS --rpc-url $BASE_SEPOLIA_RPC_URL

# Get tokens owned by user
cast call CONTRACT_ADDRESS "tokensOfOwner(address)" YOUR_ADDRESS --rpc-url $BASE_SEPOLIA_RPC_URL
```

## 📋 Post-Deployment Checklist

### ✅ Verification Steps
- [ ] Contract deployed successfully
- [ ] Contract verified on BaseScan
- [ ] Random tier pricing (0.0003 ETH) works
- [ ] Custom tier pricing (0.0015 ETH) works
- [ ] Analytics functions return data
- [ ] Owner functions work (withdraw, pause)
- [ ] Events are emitted correctly

### 🔗 Important Links
- **Base Sepolia Explorer**: https://sepolia.basescan.org/
- **Base Sepolia RPC**: https://sepolia.base.org
- **Base Sepolia Faucet**: https://bridge.base.org/deposit
- **Base Docs**: https://docs.base.org/

## 🚨 Common Issues & Solutions

### Issue: "Insufficient funds"
- **Solution**: Get more Base Sepolia ETH from faucet
- **Check**: `cast balance YOUR_ADDRESS --rpc-url $BASE_SEPOLIA_RPC_URL`

### Issue: "Verification failed"
- **Solution**: Wait 1-2 minutes after deployment, then try manual verification
- **Alternative**: Use `--watch` flag for automatic retries

### Issue: "Custom tier must have customizations"
- **Solution**: When testing custom tier, provide non-empty `customizedLetters` array
- **Example**: `'["A","E","M"]'` instead of `'[]'`

### Issue: "Insufficient payment for selected tier"
- **Solution**: Check you're sending correct ETH amount:
  - Random tier: `--value 0.0003ether`
  - Custom tier: `--value 0.0015ether`

## 📊 Expected Deployment Output

```
=== DEPLOYMENT SUMMARY ===
Network: Base Sepolia
Chain ID: 84532
Contract: AlphabetAffirmationsNFTV2
Address: 0x1234567890abcdef...
Symbol: ALPHAV2
Hybrid Pricing:
  Random Tier: 0.0003 ETH (~$0.99)
  Custom Tier: 0.0015 ETH (~$5.00)
Features:
  ✓ Two-tier pricing
  ✓ Customization tracking
  ✓ Name-first psychology support
  ✓ Analytics & user history
  ✓ Emergency pause functionality
Verification:
  Verify on BaseScan: https://sepolia.basescan.org/address/0x1234...
========================
```

## 🎯 Next Steps After Deployment
1. **Update frontend** with new contract address
2. **Test integration** with MiniKit wallet connection
3. **Implement hybrid pricing** in React components
4. **Build name-first preview** component
5. **Create customization flow** for $5 tier

---

**Ready to deploy?** Run the commands above and you'll have the V2 contract live on Base Sepolia for testing!
