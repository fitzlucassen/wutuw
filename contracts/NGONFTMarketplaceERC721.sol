// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import './NGONFTMinter.sol';
/// @author Thibault.D
/// @title NGO NFT Marketplace
contract NGONFTMarketplaceERC721 is PaymentSplitter, NGONFTMinter {
    uint256 private teamLength;

    constructor(string memory _name, string memory _symbol, address[] memory _team, uint256[] memory _teamShares, bytes32 _merkleRoot, string memory _baseURI) 
        PaymentSplitter(_team, _teamShares)
        NGONFTMinter(_name, _symbol, _merkleRoot, _baseURI) {
        teamLength = _team.length;
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
    // Release
    function releaseAll() external {
        for (uint256 i = 0; i < teamLength; i++) {
            release(payable(payee(i)));
        }
    }
    receive() external payable override {
        revert("Only if you mint");
    }
}
