import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
const tokens = require('../scripts/tokens.json');

interface TestContext {
    name: string;
    symbol: string;
    team: string[];
    merkleRoot: string;
    baseUri: string;
    NonFunToken: any;
    nonFunToken: any;
    ownerSigner: any;
    account: any;
    otherAccounts: any[];
    proof: string[];
}

describe("NGONFTMarketplace", function () {
    let testContext: TestContext = {
        name: 'Wutuw NGO',
        symbol: 'WTW',
        team: [],
        merkleRoot: '0x09dd596f43e2a3bbb9c65e9000c12a3d88c33e6de9796025ecc75fc7da5760fe',
        baseUri: 'ipfs://QmUohsJSFA8X7oHjQrmpvJphGqwSb4XW3KdWHMi6kgw7uG/',
        NonFunToken: null,
        nonFunToken: null,
        ownerSigner: null,
        account: null,
        otherAccounts: [],
        proof: []
    };

    before(async function () {
        let address = tokens;
        address.forEach((element: { address: string; }) => {
            testContext.team.push(element.address);
        });
        testContext.NonFunToken = await ethers.getContractFactory('NGONFTMarketplaceERC721');
    });

    beforeEach(async function () {
        const signers = await ethers.getSigners();
        const owner = signers[0];
        const account1 = signers[1];
        const otheraccounts = signers.slice(2);

        const tmp = await ethers.getContractFactory('NGONFTEnumerable');
        const contract = await tmp.deploy(["1","2","3","4","5","6","7","8","9"], [otheraccounts[0].address, otheraccounts[0].address, otheraccounts[0].address, otheraccounts[1].address, otheraccounts[1].address, otheraccounts[1].address, otheraccounts[2].address, otheraccounts[2].address, otheraccounts[2].address]);
        await contract.deployed();
        // deploy the contract
        testContext.nonFunToken = await testContext.NonFunToken.deploy(testContext.name, testContext.symbol, testContext.merkleRoot, testContext.baseUri);
        await testContext.nonFunToken.deployed();

        // Get the contractOwner and collector address
        

        const leaves = [owner.address, account1.address].map(x => keccak256(x));
        const tree = new MerkleTree(leaves, keccak256, { sort: true });
        const root = tree.getHexRoot();
        const leaf = keccak256(account1.address);
        testContext.proof = tree.getHexProof(leaf);

        testContext.ownerSigner = owner;
        testContext.account = account1;
        testContext.otherAccounts = otheraccounts;
        await testContext.nonFunToken.connect(owner).setMerkleRoot(root);
        await testContext.nonFunToken.setStep(1);

        const t = 1673355054;
        await testContext.nonFunToken.setEnumerableAddress(contract.address);
        await testContext.nonFunToken.setSaleStartTime(t);
        await testContext.nonFunToken.setMaxSupply(9);
        await testContext.nonFunToken.setMaxWhitelist(1);
    });

    describe("Deployment", function () {
        it("Should has the correct name and symbol ", async function () {
            expect(await testContext.nonFunToken.name()).to.equal("Wutuw NGO");
            expect(await testContext.nonFunToken.symbol()).to.equal("WTW");
        });

        it("Should mint a token with token ID 1 to account1", async function () {
            const v = ethers.utils.parseEther("0.0025")
            await testContext.nonFunToken.connect(testContext.account).whitelistMint(testContext.account.address, testContext.proof, 1, { value: v });
            expect(await testContext.nonFunToken.ownerOf(1)).to.equal(testContext.account.address);
            expect(await testContext.nonFunToken.balanceOf(testContext.account.address)).to.equal(1);
        });

        it("Should mint a token with token ID 2 to account1", async function () {
            const v = ethers.utils.parseEther("0.0025");
            await testContext.nonFunToken.connect(testContext.account).whitelistMint(testContext.account.address, testContext.proof, 1, { value: v });
            await testContext.nonFunToken.setStep(2);

            const e = ethers.utils.parseEther("0.004");
            await testContext.nonFunToken.connect(testContext.account).publicSaleMint(testContext.account.address, 2, { value: e });

            expect(await testContext.nonFunToken.ownerOf(2)).to.equal(testContext.account.address);
            expect(await testContext.nonFunToken.balanceOf(testContext.account.address)).to.equal(2);
        });

        it("Same address can't mint 2 token", async function () {
            const v = ethers.utils.parseEther("0.0025")
            await testContext.nonFunToken.connect(testContext.account).whitelistMint(testContext.account.address, testContext.proof, 1, { value: v });
            await expect(
                testContext.nonFunToken.connect(testContext.account).whitelistMint(testContext.account.address, testContext.proof, 2, { value: v })
            ).to.be.revertedWith("You can only get 1 NFT on the Whitelist Sale");
        });

        it("Can't whitelist mint if sale is in the future", async function () {
            const v = ethers.utils.parseEther("0.0025")
            await testContext.nonFunToken.setSaleStartTime(Date.now());
            await expect(
                testContext.nonFunToken.connect(testContext.account).whitelistMint(testContext.account.address, testContext.proof, 1, { value: v })
            ).to.be.revertedWith("whitelist-sale has not started yet");
        });

        // it("Can't mint when whitelist is paused, but ok when resumed", async function () {
        //     const v = ethers.utils.parseEther("0.0025")

        //     await testContext.nonFunToken.connect(testContext.ownerSigner).pauseMint();

        //     await expect(
        //         testContext.nonFunToken.connect(testContext.account).whitelistMint(testContext.account.address, testContext.proof, 1, { value: v })
        //     ).to.be.revertedWith("Mint is paused");

        //     await testContext.nonFunToken.connect(testContext.ownerSigner).resumeMint();

        //     await testContext.nonFunToken.connect(testContext.account).whitelistMint(testContext.account.address, testContext.proof, 1, { value: v });
        // });

        it('Should has the correct baseURI ', async function () {
            const result = testContext.baseUri;
            const baseUri = await testContext.nonFunToken.baseURI();
            expect(baseUri).to.equal(result);

            const v = ethers.utils.parseEther("0.0025")

            await testContext.nonFunToken.connect(testContext.account).whitelistMint(testContext.account.address, testContext.proof, 1, { value: v });

            const tokenUri = await testContext.nonFunToken.tokenURI(1);
            expect(tokenUri).to.equal(result + "1.json");
        });
        
        it("Can't mint an already minted token", async function () {
            const v = ethers.utils.parseEther("0.004")
            await testContext.nonFunToken.setStep(2);
            await testContext.nonFunToken.connect(testContext.account).publicSaleMint(testContext.account.address, 6, { value: v });
            await expect(
                testContext.nonFunToken.connect(testContext.account).publicSaleMint(testContext.account.address, 6, { value: v })
            ).to.be.revertedWith("Token ID does not exist or already bought!");
            await expect(
                testContext.nonFunToken.connect(testContext.account).publicSaleMint(testContext.account.address, 60, { value: v })
            ).to.be.revertedWith("Token ID does not exist or already bought!");
        });

        it("Withdraw functions by NGO only and reason stored in blockchain", async function () {
            const v = ethers.utils.parseEther("0.004")
            await testContext.nonFunToken.setStep(2);
            await testContext.nonFunToken.connect(testContext.account).publicSaleMint(testContext.account.address, 5, { value: v });
            await testContext.nonFunToken.connect(testContext.account).publicSaleMint(testContext.account.address, 6, { value: v });

            await testContext.nonFunToken.connect(testContext.otherAccounts[1]).withdrawFunds("ocelot population");

            const resultRightNGO = await testContext.nonFunToken.connect(testContext.account).getTokenWithdrawReason("6");
            const resultWrongNGO = await testContext.nonFunToken.connect(testContext.account).getTokenWithdrawReason("4");
            expect(resultRightNGO).to.equal("ocelot population");
            expect(resultWrongNGO).to.equal("");
        });
    });
});