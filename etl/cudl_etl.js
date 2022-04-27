require('dotenv').config()
let network = process.env.NETWORK == null ? 0 : parseInt(process.env.NETWORK)

const ethereum = new (require("./utils/ethereum"))(
  process.env.NFT20_INFURA
);

console.log(process.env.NFT20_DB_USER)

storage = new (require("./utils/storage"))({
  user: process.env.NFT20_DB_USER,
  host: process.env.NFT20_DB_HOST,
  database: "verynifty",
  password: process.env.NFT20_DB_PASSWORD,
  port: 25061,
  ssl: true,
  ssl: { rejectUnauthorized: false },
});
let CUDL = require("./utils/cudl")
const cudl = new CUDL(ethereum, storage);

const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

(async () => {
  while (true) {
    await sleep(8000);
    try {
      await cudl.run();
    } catch (error) {
      console.log("An error occured", error)
    }
  }
})();
