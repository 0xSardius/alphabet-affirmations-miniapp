// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AlphabetAffirmationsNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _nextTokenId = 1; // Start from 1
    uint256 public constant MINT_PRICE = 0.005 ether; // ~$5 USD
    
    struct AlphabetData {
        string childName;
        string[26] words; // Fixed array for A-Z
        uint256 timestamp;
        address minter;
    }
    
    mapping(uint256 => AlphabetData) public alphabets;
    
    event AlphabetMinted(
        uint256 indexed tokenId, 
        address indexed minter, 
        string childName, 
        uint256 timestamp
    );
    
    constructor() ERC721("Alphabet Affirmations", "ALPHA") Ownable(msg.sender) {}
    
    function mintAlphabet(
        string calldata childName,
        string[26] calldata words,
        string calldata tokenURI
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(bytes(childName).length > 0, "Child name required");
        require(bytes(childName).length <= 50, "Child name too long");
        
        // Validate all words are provided and not empty
        for (uint256 i = 0; i < 26; i++) {
            require(bytes(words[i]).length > 0, "All words must be provided");
        }
        
        uint256 tokenId = _nextTokenId++;
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        alphabets[tokenId] = AlphabetData({
            childName: childName,
            words: words,
            timestamp: block.timestamp,
            minter: msg.sender
        });
        
        emit AlphabetMinted(tokenId, msg.sender, childName, block.timestamp);
        
        return tokenId;
    }
    
    function getAlphabetWords(uint256 tokenId) external view returns (string[26] memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return alphabets[tokenId].words;
    }
    
    function getAlphabetData(uint256 tokenId) external view returns (AlphabetData memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return alphabets[tokenId];
    }
    
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
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