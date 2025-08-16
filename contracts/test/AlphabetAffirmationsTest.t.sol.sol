// contracts/test/AlphabetAffirmationsNFT.t.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {AlphabetAffirmationsNFT} from "../src/AlphabetAffirmationsNFT.sol";

contract AlphabetAffirmationsNFTTest is Test {
    AlphabetAffirmationsNFT public nft;
    address public owner;
    address public user1;
    address public user2;
    
    uint256 public constant MINT_PRICE = 0.0015 ether;
    
    // Sample alphabet words for testing
    string[26] public sampleWords = [
        "Amazing", "Brave", "Creative", "Determined", "Energetic",
        "Friendly", "Generous", "Happy", "Intelligent", "Joyful",
        "Kind", "Loving", "Magnificent", "Nice", "Outstanding",
        "Positive", "Quick", "Remarkable", "Strong", "Talented",
        "Unique", "Valuable", "Wonderful", "eXtraordinary", "Young", "Zealous"
    ];
    
    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        vm.prank(owner);
        nft = new AlphabetAffirmationsNFT();
        
        // Give users some ETH
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
    }
    
    function test_InitialState() public {
        assertEq(nft.name(), "Alphabet Affirmations");
        assertEq(nft.symbol(), "ALPHA");
        assertEq(nft.owner(), owner);
        assertEq(nft.totalSupply(), 0);
        assertEq(nft.MINT_PRICE(), MINT_PRICE);
    }
    
    function test_MintAlphabet() public {
        vm.prank(user1);
        uint256 tokenId = nft.mintAlphabet{value: MINT_PRICE}(
            "Emma",
            sampleWords,
            "https://example.com/metadata/1.json"
        );
        
        assertEq(tokenId, 1);
        assertEq(nft.ownerOf(tokenId), user1);
        assertEq(nft.totalSupply(), 1);
        assertEq(nft.tokenURI(tokenId), "https://example.com/metadata/1.json");
        
        // Check alphabet data
        AlphabetAffirmationsNFT.AlphabetData memory data = nft.getAlphabetData(tokenId);
        assertEq(data.childName, "Emma");
        assertEq(data.minter, user1);
        assertGt(data.timestamp, 0);
        
        // Check words
        string[26] memory words = nft.getAlphabetWords(tokenId);
        assertEq(words[0], "Amazing");
        assertEq(words[25], "Zealous");
    }
    
    function test_MintMultipleAlphabets() public {
        // User1 mints first alphabet
        vm.prank(user1);
        uint256 tokenId1 = nft.mintAlphabet{value: MINT_PRICE}(
            "Emma",
            sampleWords,
            "https://example.com/metadata/1.json"
        );
        
        // User2 mints second alphabet
        vm.prank(user2);
        uint256 tokenId2 = nft.mintAlphabet{value: MINT_PRICE}(
            "Liam",
            sampleWords,
            "https://example.com/metadata/2.json"
        );
        
        assertEq(tokenId1, 1);
        assertEq(tokenId2, 2);
        assertEq(nft.totalSupply(), 2);
        assertEq(nft.ownerOf(tokenId1), user1);
        assertEq(nft.ownerOf(tokenId2), user2);
    }
    
    function test_RevertInsufficientPayment() public {
        vm.prank(user1);
        vm.expectRevert("Insufficient payment");
        nft.mintAlphabet{value: MINT_PRICE - 1}(
            "Emma",
            sampleWords,
            "https://example.com/metadata/1.json"
        );
    }
    
    function test_RevertEmptyChildName() public {
        vm.prank(user1);
        vm.expectRevert("Child name required");
        nft.mintAlphabet{value: MINT_PRICE}(
            "",
            sampleWords,
            "https://example.com/metadata/1.json"
        );
    }
    
    function test_RevertChildNameTooLong() public {
        vm.prank(user1);
        vm.expectRevert("Child name too long");
        nft.mintAlphabet{value: MINT_PRICE}(
            "ThisNameIsWayTooLongAndShouldFailValidationBecauseItExceedsFiftyCharacters",
            sampleWords,
            "https://example.com/metadata/1.json"
        );
    }
    
    function test_RevertEmptyWord() public {
        string[26] memory invalidWords = sampleWords;
        invalidWords[0] = ""; // Empty first word
        
        vm.prank(user1);
        vm.expectRevert("All words must be provided");
        nft.mintAlphabet{value: MINT_PRICE}(
            "Emma",
            invalidWords,
            "https://example.com/metadata/1.json"
        );
    }
    
    function test_Withdraw() public {
        // Mint an NFT to add funds to contract
        vm.prank(user1);
        nft.mintAlphabet{value: MINT_PRICE}(
            "Emma",
            sampleWords,
            "https://example.com/metadata/1.json"
        );
        
        uint256 contractBalance = address(nft).balance;
        uint256 ownerBalanceBefore = owner.balance;
        
        assertEq(contractBalance, MINT_PRICE);
        
        // Owner withdraws
        vm.prank(owner);
        nft.withdraw();
        
        assertEq(address(nft).balance, 0);
        assertEq(owner.balance, ownerBalanceBefore + MINT_PRICE);
    }
    
    function test_RevertWithdrawNotOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        nft.withdraw();
    }
    
    function test_RevertWithdrawNoFunds() public {
        vm.prank(owner);
        vm.expectRevert("No funds to withdraw");
        nft.withdraw();
    }
    
    function test_GetNonExistentToken() public {
        vm.expectRevert("Token does not exist");
        nft.getAlphabetData(999);
        
        vm.expectRevert("Token does not exist");
        nft.getAlphabetWords(999);
    }
    
    function test_EventEmission() public {
        vm.expectEmit(true, true, false, true);
        emit AlphabetAffirmationsNFT.AlphabetMinted(1, user1, "Emma", block.timestamp);
        
        vm.prank(user1);
        nft.mintAlphabet{value: MINT_PRICE}(
            "Emma",
            sampleWords,
            "https://example.com/metadata/1.json"
        );
    }
}