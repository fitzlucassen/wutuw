import { ethers } from "hardhat";
const tokens = require("./tokens.json");

async function main() {
  let team: any[] = [];
  const merkleRoot = '0x09dd596f43e2a3bbb9c65e9000c12a3d88c33e6de9796025ecc75fc7da5760fe';
  const baseUri = 'QmTeGpud5ewvKp48yv7QvqoRSJeZ4EoNaZTmwFjgcPSgsR';

  let addresses = tokens;
  addresses.forEach((element: { address: any; }) => {
    team.push(element.address);
  });

  const NFTMarketplace = await ethers.getContractFactory("NGONFTMarketplaceERC721");
  const nftcontract = await NFTMarketplace.deploy("Wutuw NGO", "WTW", team, [80, 20], merkleRoot, baseUri);

  await nftcontract.deployed();

  console.log(
    `NFTMarketplace deployed to ${nftcontract.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
