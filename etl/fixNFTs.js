require('dotenv').config()
let network = process.env.NETWORK == null ? 1 : parseInt(process.env.NETWORK)

const ethereum = new (require("./utils/ethereum"))(
    process.env.NFT20_MATIC
);

console.log(process.env.NFT20_DB_USER)

ERC721ABI = require("../contracts/ERC721.abi");

const { default: Axios } = require("axios");

storage = new (require("./utils/storage"))({
    user: process.env.NFT20_DB_USER,
    host: process.env.NFT20_DB_HOST,
    database: "verynifty",
    password: process.env.NFT20_DB_PASSWORD,
    port: 25061,
    ssl: true,
    ssl: { rejectUnauthorized: false },
});

const os = new (require("./utils/os_client"))(storage
);


let NFT20 = require("./utils/nft20")
const nft20 = new NFT20(ethereum, storage);

const sleep = (waitTimeInMs) =>
    new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

(async () => {
  
    await nft20.getNFT("0x7ea3cca10668b8346aec0bf1844a49e995527c8b", "645")

})();
