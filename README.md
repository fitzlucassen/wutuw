# Wutuw Project

This project aims to propose a simple NFT marketplace in which each token represents an NGO.
By buying a NGO token, your funds goes directly to the NGO you chose.
But to withdraw your funds, NGO has to provide proof of usage.

## Technologies

### Hardhat

Project is bootstraped with **hardhat**. You'll see the contracts in *contracts* folder. 
You'll also be able to see some scripts:
- ``deploy.ts`` to deploy contracts 
- ``generateMerkleProof.js`` to generate merkle root and proof depending on testing addresses
- ``uploadFilesToPinata.ts`` to upload assets to pinata and ipfs

Try running some of the following tasks:

```shell
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts
```

### Frontend

Front end can be found in ``wotow-webapp``.
It's an angular webapp that can be showed with the following command line:

```shell
cd wotow-webapp
ng serve
```

### Auth system

Auth is managed by MetaMask. But to manage more security and persistence of our user, we setup a firebase database.

This firebase DB stores user addresses and for each of them, generate a nonce to sign for the next login.
The backend is written in typescript and executed in Firebase Cloud Functions on demand when asking for auth.
The code can be found in `firebase-functions`