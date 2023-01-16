import { Injectable } from '@angular/core';
import { Network, Alchemy } from 'alchemy-sdk';
import { Subject, } from 'rxjs';
import { NGONFT } from '../models/NFT';
import Web3 from 'web3';
import { HttpClient } from '@angular/common/http';

declare let require: any;
declare let window: any;

let NFTContractABI = require('../../../../artifacts/contracts/NGONFTMarketplaceERC721.sol/NGONFTMarketplaceERC721.json');
let NFTTokenContractABI = require('../../../../artifacts/contracts/NGONFTEnumerable.sol/NGONFTEnumerable.json');

@Injectable({
    providedIn: 'root'
})
export class ContractService {
    private _web3: any;
    private _mintTokenContract: any;
    private _mintTokenContractAddress: string = "0x94aBc61AEb42e358C20FD52BbAeCe1F440C927D3";
    private _tokenContract: any;
    private _tokenContractAddress: string = "0x090C6D4bC0Cb189eEFb15050bFeE937490bb4996";
    private alchemy: Alchemy;
    private settings = {
        apiKey: "Inb5K0Pei3nNWwyhIY57n1a_5TRR17dM",
        network: Network.MATIC_MUMBAI,
    };
    constructor(private http: HttpClient) {
        this.alchemy = new Alchemy(this.settings);

        if (typeof window.ethereum !== 'undefined') {
            // Use Mist/MetaMask's provider
            this._web3 = new Web3(window.ethereum);
        } else {
            console.warn('Please use a dapp browser like mist or MetaMask plugin for chrome');
        }

        this._mintTokenContract = new this._web3.eth.Contract(NFTContractABI.abi, this._mintTokenContractAddress, { gasLimit: "1000000" });
        this._tokenContract = new this._web3.eth.Contract(NFTTokenContractABI.abi, this._tokenContractAddress, { gasLimit: "1000000" });
    }

    async getBalance(userAddress: any) {
        const results = await this.alchemy.nft.getNftsForOwner(userAddress, {
            contractAddresses: [this._mintTokenContractAddress]
        });
        const nfts = await Promise.all(results.ownedNfts.map(async (element) => {
            const reason = await this._tokenContract.methods.getTokenWithdrawReason(element.tokenId).call();
            let x: NGONFT = {
                balance: element.balance,
                description: element.description,
                title: element.title,
                tokenId: element.tokenId,
                image: element.rawMetadata?.image,
                reason: reason,
                price: undefined
            };

            return x;
        }));

        console.log(results);
        console.log(nfts);
        return nfts;
    }

    async getAvailableNFTs(userAddress: any) {
        let nfts: NGONFT[] = [];

        const tokenIds = await this._tokenContract.methods.getTokenNotMinted().call();
        const step = await this._mintTokenContract.methods.sellingStep().call();
        const results = await this.alchemy.nft.getNftsForOwner(userAddress, {
            contractAddresses: [this._mintTokenContractAddress]
        });
        tokenIds.forEach((element: any) => {
            const localToken = require('../../../../assets/json/' + element + '.json');
            if(results.ownedNfts.findIndex(n => n.tokenId == element) < 0) {
                nfts.push({
                    balance: 0,
                    description: localToken.description,
                    image: localToken.image,
                    reason: null,
                    title: localToken.name,
                    tokenId: element,
                    price: step == 1 ? 0.0025 : 0.004
                });
            }
        });

        return nfts;
    }

    async mintNFT(userAddress: any, tokenId: string, userProof: any) {
        const step = await this._mintTokenContract.methods.sellingStep().call();

        let result: any;
        if (step == 0) {
            alert('Sorry but whitelist sale has not started yet!');
            return;
        }

        if (step == 1)
            result = await this._mintTokenContract.methods.whitelistMint(userAddress, [userProof], parseInt(tokenId)).send({from: userAddress, value: 2500000000000000 });
        else if (step == 2)
            result = await this._mintTokenContract.methods.publicSaleMint(userAddress, parseInt(tokenId)).send({ from: userAddress, value: 4000000000000000 });
        else {
            alert('Sorry but sale is finished!');
            return;
        }
    }
}