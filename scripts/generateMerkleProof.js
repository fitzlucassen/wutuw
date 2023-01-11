const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const tokens = require("./tokens.json");

async function main() {
    let tab = [];
    tokens.map((token) => {
        tab.push(token.address);
    });
    const leaves = tab.map((address) => keccak256(address));
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    const root = tree.getHexRoot();
    const leaf = keccak256("0x54924E0F426E213530020723815e77311C1C016C");
    const proof = tree.getHexProof(leaf);
    console.log("root : " + root);
    console.log("proof : " + proof);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });