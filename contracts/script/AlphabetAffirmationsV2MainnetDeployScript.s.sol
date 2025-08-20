// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import "../src/AlphabetAffirmationsNFTV2.sol";

/**
 * @title AlphabetAffirmationsV2 Mainnet Deployment Script
 * @dev Deploy the V2 contract with hybrid pricing to Base Mainnet
 * 
 * Usage:
 * forge script script/AlphabetAffirmationsV2MainnetDeployScript.s.sol:AlphabetAffirmationsV2MainnetDeployScript --rpc-url $BASE_MAINNET_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify --etherscan-api-key $BASESCAN_API_KEY
 */
contract AlphabetAffirmationsV2MainnetDeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the V2 contract
        AlphabetAffirmationsNFTV2 nftContract = new AlphabetAffirmationsNFTV2();
        
        console.log("AlphabetAffirmationsNFTV2 deployed to:", address(nftContract));
        console.log("Contract owner:", nftContract.owner());
        console.log("Random tier price (wei):", nftContract.RANDOM_PRICE());
        console.log("Custom tier price (wei):", nftContract.CUSTOM_PRICE());
        console.log("Random tier price (ETH):", nftContract.RANDOM_PRICE() / 1e18);
        console.log("Custom tier price (ETH):", nftContract.CUSTOM_PRICE() / 1e18);

        vm.stopBroadcast();
        
        // Log deployment summary
        console.log("\n=== MAINNET DEPLOYMENT SUMMARY ===");
        console.log("Network: Base Mainnet");
        console.log("Chain ID: 8453");
        console.log("Contract: AlphabetAffirmationsNFTV2");
        console.log("Address:", address(nftContract));
        console.log("Symbol: ALPHAV2");
        console.log("Hybrid Pricing:");
        console.log("  Random Tier: 0.0003 ETH (~$0.99)");
        console.log("  Custom Tier: 0.0015 ETH (~$5.00)");
        console.log("Features:");
        console.log("  * Two-tier pricing");
        console.log("  * Customization tracking");
        console.log("  * Name-first psychology support");
        console.log("  * Analytics & user history");
        console.log("  * Emergency pause functionality");
        console.log("Verification:");
        console.log("  Verify on BaseScan: https://basescan.org/address/", address(nftContract));
        console.log("==================================");
    }
}
