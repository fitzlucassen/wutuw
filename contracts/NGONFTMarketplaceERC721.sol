// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import './NGONFTMinter.sol';
/// @author Thibault.D
/// @title NGO NFT Marketplace
contract NGONFTMarketplaceERC721 is NGONFTMinter {
    // attribution du pourcentage pour chaque ong
    mapping(address => uint256) _ongPercentages;

    constructor(string memory _name, string memory _symbol, bytes32 _merkleRoot, string memory _baseURI) 
        NGONFTMinter(_name, _symbol, _merkleRoot, _baseURI) {
    }

    // Setters
    function setSaleStartTime(uint256 _saleStartTime) external onlyOwner {
        saleStartTime = _saleStartTime;
    }
    function setStep(uint256 _step) external onlyOwner {
        sellingStep = Step(_step);
    }
    function setMaxSupply(uint16 _maxSupply_) external onlyOwner {
        _maxSupply = _maxSupply_;
    }
    function setMaxWhitelist(uint16 _maxWhitelist_) external onlyOwner {
        _maxWhitelist = _maxWhitelist_;
        _maxPublic = _maxSupply - _maxWhitelist;
    }
}
