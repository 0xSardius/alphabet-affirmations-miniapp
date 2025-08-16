// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AlphabetAffirmationsNFTV2
 * @dev NFT contract for personalized alphabet affirmations with hybrid pricing model
 * Features:
 * - Two-tier pricing: Random ($0.99) vs Custom ($5.00)
 * - Customization tracking for premium tier
 * - Name-first psychology with child letter prominence
 * - Full alphabet storage with metadata
 */
contract AlphabetAffirmationsNFTV2 is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _nextTokenId = 1; // Start from 1
    
    // Hybrid pricing structure
    uint256 public constant RANDOM_PRICE = 0.0003 ether;  // ~$0.99 at $3300 ETH
    uint256 public constant CUSTOM_PRICE = 0.0015 ether;  // ~$5.00 at $3300 ETH
    
    // Mint tier enumeration
    enum MintTier { RANDOM, CUSTOM }
    
    // Enhanced alphabet data structure
    struct AlphabetData {
        string childName;
        string[26] words;           // A-Z affirmation words
        uint256 timestamp;
        address minter;
        MintTier tier;              // Random or Custom tier
        bool hasCustomizations;     // Whether any words were customized
        string[] customizedLetters; // Which letters were customized (for analytics)
        string nameLetters;         // Child's name letters (for name-first display)
    }
    
    // Storage mappings
    mapping(uint256 => AlphabetData) public alphabets;
    
    // Analytics tracking
    mapping(MintTier => uint256) public mintsByTier;
    mapping(address => uint256) public userMintCounts;
    uint256 public totalCustomizations;
    
    // Events
    event AlphabetMinted(
        uint256 indexed tokenId, 
        address indexed minter, 
        string childName,
        MintTier tier,
        bool hasCustomizations,
        uint256 timestamp
    );
    
    event WordCustomized(
        uint256 indexed tokenId,
        string letter,
        string oldWord,
        string newWord
    );
    
    constructor() ERC721("Alphabet Affirmations V2", "ALPHAV2") Ownable(msg.sender) {}
    
    /**
     * @dev Mint an alphabet NFT with hybrid pricing
     * @param childName The child's name for personalization
     * @param words Array of 26 words (A-Z)
     * @param metadataURI IPFS URI for NFT metadata
     * @param tier Random or Custom tier
     * @param customizedLetters Array of letters that were customized
     * @param nameLetters String of child's name letters for display
     */
    function mintAlphabet(
        string calldata childName,
        string[26] calldata words,
        string calldata metadataURI,
        MintTier tier,
        string[] calldata customizedLetters,
        string calldata nameLetters
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        // Validate payment based on tier
        uint256 requiredPrice = tier == MintTier.RANDOM ? RANDOM_PRICE : CUSTOM_PRICE;
        require(msg.value >= requiredPrice, "Insufficient payment for selected tier");
        
        // Validate inputs
        require(bytes(childName).length > 0, "Child name required");
        require(bytes(childName).length <= 50, "Child name too long");
        require(bytes(nameLetters).length > 0, "Name letters required");
        
        // Validate all words are provided and not empty
        for (uint256 i = 0; i < 26; i++) {
            require(bytes(words[i]).length > 0, "All words must be provided");
            require(bytes(words[i]).length <= 30, "Word too long");
        }
        
        // Custom tier validation
        if (tier == MintTier.CUSTOM) {
            require(customizedLetters.length > 0, "Custom tier must have customizations");
        }
        
        uint256 tokenId = _nextTokenId++;
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        // Store alphabet data
        alphabets[tokenId] = AlphabetData({
            childName: childName,
            words: words,
            timestamp: block.timestamp,
            minter: msg.sender,
            tier: tier,
            hasCustomizations: customizedLetters.length > 0,
            customizedLetters: customizedLetters,
            nameLetters: nameLetters
        });
        
        // Update analytics
        mintsByTier[tier]++;
        userMintCounts[msg.sender]++;
        if (customizedLetters.length > 0) {
            totalCustomizations += customizedLetters.length;
        }
        
        emit AlphabetMinted(
            tokenId, 
            msg.sender, 
            childName, 
            tier,
            customizedLetters.length > 0,
            block.timestamp
        );
        
        return tokenId;
    }
    
    /**
     * @dev Get alphabet words for a token
     */
    function getAlphabetWords(uint256 tokenId) external view returns (string[26] memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return alphabets[tokenId].words;
    }
    
    /**
     * @dev Get complete alphabet data for a token
     */
    function getAlphabetData(uint256 tokenId) external view returns (AlphabetData memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return alphabets[tokenId];
    }
    
    /**
     * @dev Get name letters for a token (for name-first display)
     */
    function getNameLetters(uint256 tokenId) external view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return alphabets[tokenId].nameLetters;
    }
    
    /**
     * @dev Get customized letters for a token
     */
    function getCustomizedLetters(uint256 tokenId) external view returns (string[] memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return alphabets[tokenId].customizedLetters;
    }
    
    /**
     * @dev Check if a token was created with custom tier
     */
    function isCustomTier(uint256 tokenId) external view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return alphabets[tokenId].tier == MintTier.CUSTOM;
    }
    
    /**
     * @dev Get total supply of minted tokens
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    /**
     * @dev Get analytics data
     */
    function getAnalytics() external view returns (
        uint256 totalMints,
        uint256 randomMints,
        uint256 customMints,
        uint256 totalCustomizationCount
    ) {
        return (
            _nextTokenId - 1,
            mintsByTier[MintTier.RANDOM],
            mintsByTier[MintTier.CUSTOM],
            totalCustomizations
        );
    }
    
    /**
     * @dev Get user's mint history
     */
    function getUserMintCount(address user) external view returns (uint256) {
        return userMintCounts[user];
    }
    
    /**
     * @dev Get all tokens owned by a user (for collection view)
     */
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        if (tokenCount == 0) {
            return new uint256[](0);
        }
        
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 index = 0;
        
        for (uint256 tokenId = 1; tokenId < _nextTokenId && index < tokenCount; tokenId++) {
            if (_ownerOf(tokenId) == owner) {
                tokenIds[index] = tokenId;
                index++;
            }
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Update pricing (owner only)
     */
    function updatePricing(uint256 /* newRandomPrice */, uint256 /* newCustomPrice */) external view onlyOwner {
        // Note: This would require upgradeability pattern in production
        // For now, prices are constants but this function shows the intent
        revert("Pricing is fixed in this version");
    }
    
    /**
     * @dev Withdraw contract funds
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Emergency pause functionality (owner only)
     */
    bool public paused = false;
    
    function pause() external onlyOwner {
        paused = true;
    }
    
    function unpause() external onlyOwner {
        paused = false;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    // Apply pause check in our public mint function instead of overriding internal _mint
    
    // Override required functions
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
}
