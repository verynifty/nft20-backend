require('dotenv').config()

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
let NFT20 = require("./utils/nft20")
const nft20 = new NFT20(ethereum, storage);

const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

(async () => {
  while (true) {
      let nfts = await storage.executeAsync("SELECT nft, id FROM nft20_action GROUP BY nft, id")
      console.log(nfts)
      for (const nft of nfts) {
          console.log('Adding ', nft.nft, nft.id)
        await nft20.getNFT(nft.nft, nft.id);
        await sleep(1000)
      }
  }
})();
