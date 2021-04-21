require("dotenv").config();

let vnft_holder = require('./tmp/vnft_holders');
let mvi_holder = require('./tmp/mvi_holders');
let muse_holders = require('./tmp/muse_and_lp');
let earn_2_play = require('./tmp/e2p');
let all = require('./tmp/all_nfts');
let nft20_users = require('./tmp/nft20_users');

storage = new (require("../etl/utils/storage"))({
    user: process.env.NFT20_DB_USER,
    host: process.env.NFT20_DB_HOST,
    database: "verynifty",
    password: process.env.NFT20_DB_PASSWORD,
    port: 25061,
    ssl: true,
    ssl: { rejectUnauthorized: false },
});

const { keccak256, keccakFromString, keccakFromHexString, bufferToHex, BN } = require('ethereumjs-util');
const { MerkleTree } = require('./libMerkle.js');

const ethereum = new (require("../etl/utils/ethereum"))(
    process.env.NFT20_INFURA
);

(async () => {

    let basic = 10;
    let advanced = 15;

    let adds = {}

    for (const a of vnft_holder) {
        let address = a.address.toLowerCase();
        if (adds[address] == null) {
            adds[address] = advanced;
        } else {
            adds[address] = Math.max(adds[address], advanced)
        }
    }

    for (const a of nft20_users) {
        let address = a.address.toLowerCase();
        if (adds[address] == null) {
            adds[address] = advanced;
        } else {
            adds[address] = Math.max(adds[address], advanced)
        }
    }

    for (const a of mvi_holder) {
        let address = a.address.toLowerCase();

        if (adds[address] == null) {
            adds[address] = basic;
        } else {
            adds[address] = Math.max(adds[address], basic)
        }
    }

    for (const a of muse_holders) {
        let address = a.address.toLowerCase();

        if (adds[address] == null) {
            adds[address] = advanced;

        } else {

            adds[address] = Math.max(adds[address], advanced)
        }
    }

    for (const a of earn_2_play) {
        let address = a.address.toLowerCase();

        if (adds[address] == null) {
            adds[address] = basic;
        } else {
            adds[address] = Math.max(adds[address], basic)
        }
    }

    for (const a of all) {
        let address = a.address.toLowerCase();

        if (adds[address] == null) {
            adds[address] = basic;
        } else {
            adds[address] = Math.max(adds[address], basic)
        }
    }
    console.log(Object.keys(adds).length)

    let initial_leaves = []

    let index = 0;
    for (const key in adds) {
        if (Object.hasOwnProperty.call(adds, key)) {
            const element = adds[key];
            console.log(key)
            let leaf = ethereum.w3.eth.abi.encodeParameters(
                [
                    "uint256",
                    "address",
                    "uint256"
                ],
                [
                    index++,
                    key,
                    element
                ])
            initial_leaves.push(leaf);
        }
    }

    console.log("create tree")
    const merkleTree = new MerkleTree(initial_leaves);
    console.log("created tree")

    const root = merkleTree.getHexRoot();
    console.log(root)
    index = 0;
    for (const key in adds) {
        if (Object.hasOwnProperty.call(adds, key)) {
            const element = adds[key];
            console.log(initial_leaves[index])

            const proof = merkleTree.getHexProof(initial_leaves[index]);
            let leaf_data = ethereum.w3.eth.abi.encodeParameters(
                [
                    "uint256",
                    "address",
                    "uint256"
                ],
                [
                    index,
                    key,
                    element
                ])
            let leaf = bufferToHex(keccakFromHexString(initial_leaves[index]));

            let o = {
                index: index,
                address: key,
                amount: element,
                leaf: leaf,
                leaf_data: leaf_data,
                proof: JSON.stringify(proof)
            }
            console.log(o)
            await storage.insert('game_airdrop', o);
            index++;
        }
    }




})();

//console.log(vnft_holder)