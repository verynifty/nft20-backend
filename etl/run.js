require('dotenv').config()
let network = process.env.NETWORK == null ? 0 : parseInt(process.env.NETWORK)

const ethereum = new (require("./utils/ethereum"))(
  network == 0 ? process.env.NFT20_INFURA : process.env.NFT20_MATIC
);

storage = new (require("./utils/storage"))({
  user: process.env.NFT20_DB_USER,
  host: process.env.NFT20_DB_HOST,
  database: "verynifty",
  password: process.env.NFT20_DB_PASSWORD,
  port: 25061,
  ssl: true,
  ssl: { rejectUnauthorized: false },
});

let NFT20 = require("./utils/nft20")
const nft20 = new NFT20(ethereum, storage);

const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

(async () => {
  while (true) {
    try {
      let start = Date.now();
      console.log("start");
      await nft20.getLastData();
      let end = Date.now();
      console.log(start, end);
    } catch (error) {
      console.log(error)
    }
    await sleep(600000);
  }
})();
