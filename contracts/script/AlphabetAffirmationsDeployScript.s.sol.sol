// contracts/script/Deploy.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {AlphabetAffirmationsNFT} from "../src/AlphabetAffirmationsNFT.sol";

contract DeployScript is Script {
    function run() external returns (AlphabetAffirmationsNFT) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        AlphabetAffirmationsNFT nft = new AlphabetAffirmationsNFT();
        
        vm.stopBroadcast();
        
        console.log("=== Deployment Successful ===");
        console.log("Contract Address:", address(nft));
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Mint Price:", nft.MINT_PRICE());
        console.log("Name:", nft.name());
        console.log("Symbol:", nft.symbol());
        
        return nft;
    }
}