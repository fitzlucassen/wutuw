require('dotenv').config();
import pinataSDK, { PinataPinOptions } from '@pinata/sdk';

const key = process.env.PINATA_KEY;
const secret = process.env.PINATA_SECRET;
const JWT = process.env.JWT;
const pinata = new pinataSDK(key, secret);

const fs = require("fs");

// get json from file
let rawdata1 = fs.readFileSync('../assets/json/1.json');
let json1 = JSON.parse(rawdata1);
let rawdata2 = fs.readFileSync('../assets/json/2.json');
let json2 = JSON.parse(rawdata2);

// create table
var files = [
    {
        cpt: 1,
        file: json1,
    }, {
        cpt: 2,
        file: json2,
    }
];

const options:PinataPinOptions = {
    pinataMetadata: {
        name: "Wutuw ONG NFT collection",
    },
    pinataOptions: {
        cidVersion: 0
    }
};

pinata.pinFromFS("../assets/img", options).then((result) => {
    files.forEach(element => {
        const body = {
            name: element.file.name,
            description: element.file.description,
            image: "https://ipfs.io/ipfs/" + result.IpfsHash + "/" + element.cpt + ".jpg",
            attributes: element.file.attributes
        };

        fs.writeFileSync('../assets/json/' + element.cpt + '.json', JSON.stringify(body));
    });
    pinata.pinFromFS("../assets/json", options).then((result) => {
        console.log(result);
    }).catch((err) => {
        console.log(err);
    });
}).catch((err) => {
    console.log(err);
});
