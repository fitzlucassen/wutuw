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
let rawdata3 = fs.readFileSync('../assets/json/3.json');
let json3 = JSON.parse(rawdata3);
let rawdata4 = fs.readFileSync('../assets/json/4.json');
let json4 = JSON.parse(rawdata4);
let rawdata5 = fs.readFileSync('../assets/json/5.json');
let json5 = JSON.parse(rawdata5);
let rawdata6 = fs.readFileSync('../assets/json/6.json');
let json6 = JSON.parse(rawdata6);
let rawdata7 = fs.readFileSync('../assets/json/7.json');
let json7 = JSON.parse(rawdata7);
let rawdata8 = fs.readFileSync('../assets/json/8.json');
let json8 = JSON.parse(rawdata8);
let rawdata9 = fs.readFileSync('../assets/json/9.json');
let json9 = JSON.parse(rawdata9);

// create table
var files = [
    {
        cpt: 1,
        file: json1,
    }, {
        cpt: 2,
        file: json2,
    }, {
        cpt: 3,
        file: json3,
    }, {
        cpt: 4,
        file: json4,
    }, {
        cpt: 5,
        file: json5,
    }, {
        cpt: 6,
        file: json6,
    }, {
        cpt: 7,
        file: json7,
    }, {
        cpt: 8,
        file: json8,
    }, {
        cpt: 9,
        file: json9,
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
