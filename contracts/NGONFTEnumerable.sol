// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

/// @author Thibault.D
/// @title NGO NFT Marketplace
contract NGONFTEnumerable {
    string[] public _collectionTokenIds;
    mapping(string => bool) _tokenOwner;

    constructor(string[] memory tokenIds) {
        _collectionTokenIds = tokenIds;
    }

    function isTokenAvailable(string memory _tokenId) public view returns(bool) {
        bool idReserved = _tokenOwner[_tokenId];
        bool isInArray = false;
        for(uint8 i = 0; i < _collectionTokenIds.length; i++) {
            if(keccak256(abi.encodePacked(_collectionTokenIds[i])) == keccak256(abi.encodePacked(_tokenId))) {
                isInArray = true;
                break;
            }
        }
        return !idReserved && isInArray;
    }
    function tokenIdBought(string memory tokenId) public {
        _tokenOwner[tokenId] = true;
    }
}