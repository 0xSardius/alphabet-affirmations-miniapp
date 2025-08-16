// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import "../src/AlphabetAffirmationsNFTV2.sol";

contract AlphabetAffirmationsV2Test is Test {
    AlphabetAffirmationsNFTV2 public nftContract;
    address public owner;
    address public user1;
    address public user2;
    
    string[26] public sampleWords = [
        "Amazing", "Brave", "Creative", "Determined", "Energetic",
        "Friendly", "Generous", "Happy", "Intelligent", "Joyful",
        "Kind", "Loving", "Magnificent", "Nice", "Outstanding",
        "Positive", "Quick", "Remarkable", "Strong", "Talented",
        "Unique", "Valuable", "Wonderful", "eXtraordinary", "Young", "Zealous"
    ];
    
    string[] public customizedLetters = ["A", "E", "M"];
    string public sampleNameLetters = "EMMA";
    string public sampleTokenURI = "ipfs://QmSampleHash123";
    
    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        
        // Deploy contract
        nftContract = new AlphabetAffirmationsNFTV2();
        
        // Fund test users
        vm.deal(user1, 1 ether);
        vm.deal(user2, 1 ether);
    }
    
    function testContractDeployment() public {
        assertEq(nftContract.name(), "Alphabet Affirmations V2");
        assertEq(nftContract.symbol(), "ALPHAV2");
        assertEq(nftContract.owner(), owner);
        assertEq(nftContract.RANDOM_PRICE(), 0.0003 ether);
        assertEq(nftContract.CUSTOM_PRICE(), 0.0015 ether);
        assertEq(nftContract.totalSupply(), 0);
    }
    
    function testRandomTierMinting() public {
        vm.startPrank(user1);
        
        uint256 tokenId = nftContract.mintAlphabet{value: 0.0003 ether}(
            "Emma",
            sampleWords,
            sampleTokenURI,
            AlphabetAffirmationsNFTV2.MintTier.RANDOM,
            new string[](0), // No customizations for random tier
            sampleNameLetters
        );
        
        vm.stopPrank();
        
        // Verify minting
        assertEq(tokenId, 1);
        assertEq(nftContract.ownerOf(tokenId), user1);
        assertEq(nftContract.totalSupply(), 1);
        
        // Verify alphabet data
        AlphabetAffirmationsNFTV2.AlphabetData memory data = nftContract.getAlphabetData(tokenId);
        assertEq(data.childName, "Emma");
        assertEq(data.minter, user1);
        assertEq(uint256(data.tier), uint256(AlphabetAffirmationsNFTV2.MintTier.RANDOM));
        assertEq(data.hasCustomizations, false);
        assertEq(data.nameLetters, sampleNameLetters);
        
        // Verify analytics
        (uint256 totalMints, uint256 randomMints, uint256 customMints,) = nftContract.getAnalytics();
        assertEq(totalMints, 1);
        assertEq(randomMints, 1);
        assertEq(customMints, 0);
    }
    
    function testCustomTierMinting() public {
        vm.startPrank(user2);
        
        uint256 tokenId = nftContract.mintAlphabet{value: 0.0015 ether}(
            "Quinn",
            sampleWords,
            sampleTokenURI,
            AlphabetAffirmationsNFTV2.MintTier.CUSTOM,
            customizedLetters,
            "QUINN"
        );
        
        vm.stopPrank();
        
        // Verify minting
        assertEq(tokenId, 1);
        assertEq(nftContract.ownerOf(tokenId), user2);
        assertEq(nftContract.totalSupply(), 1);
        
        // Verify alphabet data
        AlphabetAffirmationsNFTV2.AlphabetData memory data = nftContract.getAlphabetData(tokenId);
        assertEq(data.childName, "Quinn");
        assertEq(data.minter, user2);
        assertEq(uint256(data.tier), uint256(AlphabetAffirmationsNFTV2.MintTier.CUSTOM));
        assertEq(data.hasCustomizations, true);
        assertEq(data.nameLetters, "QUINN");
        
        // Verify customized letters
        string[] memory retrievedCustomizations = nftContract.getCustomizedLetters(tokenId);
        assertEq(retrievedCustomizations.length, 3);
        assertEq(retrievedCustomizations[0], "A");
        assertEq(retrievedCustomizations[1], "E");
        assertEq(retrievedCustomizations[2], "M");
        
        // Verify analytics
        (uint256 totalMints, uint256 randomMints, uint256 customMints, uint256 totalCustomizations) = nftContract.getAnalytics();
        assertEq(totalMints, 1);
        assertEq(randomMints, 0);
        assertEq(customMints, 1);
        assertEq(totalCustomizations, 3);
    }
    
    function testInsufficientPaymentFails() public {
        vm.startPrank(user1);
        
        // Try to mint random tier with insufficient payment
        vm.expectRevert("Insufficient payment for selected tier");
        nftContract.mintAlphabet{value: 0.0001 ether}(
            "Emma",
            sampleWords,
            sampleTokenURI,
            AlphabetAffirmationsNFTV2.MintTier.RANDOM,
            new string[](0),
            sampleNameLetters
        );
        
        // Try to mint custom tier with random tier payment
        vm.expectRevert("Insufficient payment for selected tier");
        nftContract.mintAlphabet{value: 0.0003 ether}(
            "Emma",
            sampleWords,
            sampleTokenURI,
            AlphabetAffirmationsNFTV2.MintTier.CUSTOM,
            customizedLetters,
            sampleNameLetters
        );
        
        vm.stopPrank();
    }
    
    function testCustomTierRequiresCustomizations() public {
        vm.startPrank(user1);
        
        vm.expectRevert("Custom tier must have customizations");
        nftContract.mintAlphabet{value: 0.0015 ether}(
            "Emma",
            sampleWords,
            sampleTokenURI,
            AlphabetAffirmationsNFTV2.MintTier.CUSTOM,
            new string[](0), // No customizations
            sampleNameLetters
        );
        
        vm.stopPrank();
    }
    
    function testInvalidInputsFail() public {
        vm.startPrank(user1);
        
        // Empty child name
        vm.expectRevert("Child name required");
        nftContract.mintAlphabet{value: 0.0003 ether}(
            "",
            sampleWords,
            sampleTokenURI,
            AlphabetAffirmationsNFTV2.MintTier.RANDOM,
            new string[](0),
            sampleNameLetters
        );
        
        // Empty name letters
        vm.expectRevert("Name letters required");
        nftContract.mintAlphabet{value: 0.0003 ether}(
            "Emma",
            sampleWords,
            sampleTokenURI,
            AlphabetAffirmationsNFTV2.MintTier.RANDOM,
            new string[](0),
            ""
        );
        
        vm.stopPrank();
    }
    
    function testTokensOfOwner() public {
        // Mint multiple tokens for user1
        vm.startPrank(user1);
        
        nftContract.mintAlphabet{value: 0.0003 ether}(
            "Emma",
            sampleWords,
            sampleTokenURI,
            AlphabetAffirmationsNFTV2.MintTier.RANDOM,
            new string[](0),
            "EMMA"
        );
        
        nftContract.mintAlphabet{value: 0.0015 ether}(
            "Alex",
            sampleWords,
            sampleTokenURI,
            AlphabetAffirmationsNFTV2.MintTier.CUSTOM,
            customizedLetters,
            "ALEX"
        );
        
        vm.stopPrank();
        
        // Mint one for user2
        vm.startPrank(user2);
        nftContract.mintAlphabet{value: 0.0003 ether}(
            "Sam",
            sampleWords,
            sampleTokenURI,
            AlphabetAffirmationsNFTV2.MintTier.RANDOM,
            new string[](0),
            "SAM"
        );
        vm.stopPrank();
        
        // Check tokens of owner
        uint256[] memory user1Tokens = nftContract.tokensOfOwner(user1);
        uint256[] memory user2Tokens = nftContract.tokensOfOwner(user2);
        
        assertEq(user1Tokens.length, 2);
        assertEq(user2Tokens.length, 1);
        assertEq(user1Tokens[0], 1);
        assertEq(user1Tokens[1], 2);
        assertEq(user2Tokens[0], 3);
    }
    
    function testWithdraw() public {
        // Mint some tokens to generate revenue
        vm.startPrank(user1);
        nftContract.mintAlphabet{value: 0.0003 ether}(
            "Emma",
            sampleWords,
            sampleTokenURI,
            AlphabetAffirmationsNFTV2.MintTier.RANDOM,
            new string[](0),
            "EMMA"
        );
        vm.stopPrank();
        
        vm.startPrank(user2);
        nftContract.mintAlphabet{value: 0.0015 ether}(
            "Quinn",
            sampleWords,
            sampleTokenURI,
            AlphabetAffirmationsNFTV2.MintTier.CUSTOM,
            customizedLetters,
            "QUINN"
        );
        vm.stopPrank();
        
        // Check contract balance
        uint256 contractBalance = address(nftContract).balance;
        assertEq(contractBalance, 0.0018 ether);
        
        // Withdraw as owner (test contract is the owner)
        uint256 ownerBalanceBefore = address(this).balance;
        nftContract.withdraw();
        uint256 ownerBalanceAfter = address(this).balance;
        
        assertEq(ownerBalanceAfter - ownerBalanceBefore, 0.0018 ether);
        assertEq(address(nftContract).balance, 0);
    }
    
    function testPauseFunctionality() public {
        // Pause contract
        nftContract.pause();
        
        // Try to mint while paused
        vm.startPrank(user1);
        vm.expectRevert("Contract is paused");
        nftContract.mintAlphabet{value: 0.0003 ether}(
            "Emma",
            sampleWords,
            sampleTokenURI,
            AlphabetAffirmationsNFTV2.MintTier.RANDOM,
            new string[](0),
            "EMMA"
        );
        vm.stopPrank();
        
        // Unpause and try again
        nftContract.unpause();
        
        vm.startPrank(user1);
        uint256 tokenId = nftContract.mintAlphabet{value: 0.0003 ether}(
            "Emma",
            sampleWords,
            sampleTokenURI,
            AlphabetAffirmationsNFTV2.MintTier.RANDOM,
            new string[](0),
            "EMMA"
        );
        vm.stopPrank();
        
        assertEq(tokenId, 1);
    }
}
