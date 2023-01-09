// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./NGONFTEnumerable.sol";

/// @author Thibault.D
/// @title NGO NFT Marketplace
contract NGONFTMinter is Ownable, ERC721, ERC721Enumerable {
     enum Step {
        Before,
        WhitelistSale,
        PublicSale
    }

    mapping(address => uint256) amountNFTsPerWalletWhitelistSale;

    bytes16 private constant _SYMBOLS = "0123456789abcdef";
    address private constant _ENUMERABLE_ADDRESS = 0xfbffbb4F8fE002a4d430bB4e427305ce76103E6E;
    uint16 internal _maxSupply = 7777;
    uint16 internal _maxWhitelist = 2777;
    uint16 internal _maxPublic = 5000;

    string public baseURI;

    Step public sellingStep;

    uint256 public wlSalePrice = 0.0025 ether;
    uint256 public publicSalePrice = 0.004 ether;

    uint256 public saleStartTime = 1672484400;
    uint256 public pauseTime = 0;

    bytes32 private merkleRoot;

    constructor(string memory _name, string memory _symbol, bytes32 _merkleRoot, string memory _baseURI)
        ERC721(_name, _symbol) 
    {
        merkleRoot = _merkleRoot;
        baseURI = _baseURI;
    }

    modifier callerIsUser() {
        require(tx.origin == msg.sender, "the caller is another contract");
        _;
    }

    // Mint functions
    function whitelistMint(address _account, bytes32[] calldata _proof, uint256 _desiredTokenId) external payable callerIsUser {
        uint256 price = wlSalePrice;

        require(price != 0, "price is 0");
        require(_account != address(0));
        require(pauseTime == 0, "Mint is paused");
        require(currentTime() >= saleStartTime, "whitelist-sale has not started yet");
        require(currentTime() < saleStartTime + 300 minutes, "Whitelist sale is finished" );
        require(sellingStep == Step.WhitelistSale, "Whitelist sale is not activated");
        require(_isWhitelisted(_account, _proof), "Not Whitelisted");
        require(amountNFTsPerWalletWhitelistSale[_account] + 1 <= 1, "You can only get 1 NFT on the Whitelist Sale");
        require(totalSupply() + 1 <= _maxWhitelist, "Max supply exceeded");
        require(msg.value >= price, "Not enough funds");
        require(NGONFTEnumerable(_ENUMERABLE_ADDRESS).isTokenAvailable(toString(_desiredTokenId)), "Token ID does not exist or already bought!");

        NGONFTEnumerable(_ENUMERABLE_ADDRESS).tokenIdBought(toString(_desiredTokenId));
        amountNFTsPerWalletWhitelistSale[_account] += 1;
        _safeMint(_account, _desiredTokenId);
    }

    function publicSaleMint(address _account, uint256 _desiredTokenId) external payable callerIsUser {
        uint256 price = publicSalePrice;

        require(price != 0, "price is 0");
        require(_account != address(0));
        require(sellingStep == Step.PublicSale, "Public sale is not activated");
        require(totalSupply() + 1 <= _maxWhitelist + _maxPublic, "Max supply exceeded");
        require(msg.value >= price, "not enough funds");
        require(NGONFTEnumerable(_ENUMERABLE_ADDRESS).isTokenAvailable(toString(_desiredTokenId)), "Token ID does not exist or already bought!");

        NGONFTEnumerable(_ENUMERABLE_ADDRESS).tokenIdBought(toString(_desiredTokenId));

        _safeMint(_account, _desiredTokenId);
    }

    // Override
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        require(_exists(_tokenId), "URI query for nonexistent token");

        return string(abi.encodePacked(baseURI, toString(_tokenId), ".json"));
    }

    // Internal functions
    function currentTime() internal view returns (uint256) {
        return block.timestamp;
    }
    function _isWhitelisted(address _account, bytes32[] calldata _proof) internal view returns (bool) {
        return MerkleProof.verify(_proof, merkleRoot, keccak256(abi.encodePacked((_account))));
    }
    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }
    /**
     * @dev Converts a `uint256` to its ASCII `string` decimal representation.
     */
    function toString(uint256 value) internal pure returns (string memory) {
        unchecked {
            uint256 length = Math.log10(value) + 1;
            string memory buffer = new string(length);
            uint256 ptr;
            /// @solidity memory-safe-assembly
            assembly {
                ptr := add(buffer, add(32, length))
            }
            while (true) {
                ptr--;
                /// @solidity memory-safe-assembly
                assembly {
                    mstore8(ptr, byte(mod(value, 10), _SYMBOLS))
                }
                value /= 10;
                if (value == 0) break;
            }
            return buffer;
        }
    }
}