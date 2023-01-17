// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

/// @author Thibault.D
/// @title NGO NFT Marketplace
contract NGONFTEnumerable {
    address private _nftMinterContract;
    address private _owner;

    address[] private _ngoAddresses;
    string[] private _collectionTokenIds;
    
    // allow to know which token has been already minted
    mapping(string => bool) _tokenMinterOwner;
    // mapping to link tokenIds to NGO addresses
    mapping(string => address) _nftTokenIdToNGOWallet;
    // NGO ether balance thanks to funds
    mapping(address => uint) _ngoBalances;
    // mapping between minted tokenId and the reason NGO will use funds
    mapping(string => string) _tokenIdWithdrawReason;

    constructor(string[] memory _tokenIds, address[] memory _tokenOwners) {
        _owner = msg.sender;
        // list of token ids pre-minted
        _collectionTokenIds = _tokenIds;
        // list of ngo 
        _ngoAddresses = _tokenOwners;

        // for each token id, we map it to its ngo funds owner
        for(uint16 i = 0; i < _collectionTokenIds.length; i++) {
            _nftTokenIdToNGOWallet[_collectionTokenIds[i]] = _tokenOwners[i];
        }
    }

    modifier isNftMinter() {
        require(msg.sender == _nftMinterContract);
        _;
    }
    modifier isOwner() {
        require(msg.sender == _owner);
        _;
    }

    function setNgoMinterAddress(address contractAddress) external isOwner {
        require(address(contractAddress) != address(0));
        _nftMinterContract = contractAddress;
    }

    function isTokenAvailable(string memory _tokenId) public view returns(bool) {
        // is token minted (bought) by a user already?
        bool idReserved = _tokenMinterOwner[_tokenId];
        bool isInArray = false;

        // is token id to be mint inside the available collection?
        for(uint8 i = 0; i < _collectionTokenIds.length; i++) {
            if(keccak256(abi.encodePacked(_collectionTokenIds[i])) == keccak256(abi.encodePacked(_tokenId))) {
                isInArray = true;
                break;
            }
        }
        return !idReserved && isInArray;
    }
    function tokenIdBought(string memory _tokenId, uint _value) public isNftMinter {
        // token id is bought by this minter
        _tokenMinterOwner[_tokenId] = true;
        // ngo balance increase
        _ngoBalances[_nftTokenIdToNGOWallet[_tokenId]] += _value;
    }
    function setReasonToTokenId(address _ngoAddress, string memory reason) public isNftMinter {
        // for each token ids
        //      set the reason of withdraw, for the token id minted && owned by the same NGO
        for(uint16 cpt = 0; cpt < _collectionTokenIds.length; cpt++) {
            if(_nftTokenIdToNGOWallet[_collectionTokenIds[cpt]] == _ngoAddress && _tokenMinterOwner[_collectionTokenIds[cpt]])
                _tokenIdWithdrawReason[_collectionTokenIds[cpt]] = reason;
        }
    }
    function isNgo(address caller) public view returns(bool) {
        bool _isNgo = false;
        uint16 cpt = 0;

        while(!_isNgo && cpt < _ngoAddresses.length) {
            _isNgo = _ngoAddresses[cpt] == caller;
            cpt++;
        }

        return _isNgo;
    }

    // Getters
    function getNgoBalanceThenReset(address _ngo) public isNftMinter returns(uint) {
        uint balance = getNgoBalance(_ngo);
        _ngoBalances[_ngo] = 0;
        return balance;
    }
    function getNgoBalance(address _ngo) public view returns(uint) {
        return _ngoBalances[_ngo];
    }
    function getTokenWithdrawReason(string memory _tokenId) public view returns(string memory) {
        return _tokenIdWithdrawReason[_tokenId];
    }
    function getTokenNGOOwner(string memory _tokenId) public view returns(address) {
        return _nftTokenIdToNGOWallet[_tokenId];
    }
    function getTokenNotMinted() public view returns(string[] memory) {
        return _collectionTokenIds;
    }
}