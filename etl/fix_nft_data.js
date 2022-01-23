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
    try {

        let nfts = await storage.executeAsync(`
        select * from nft20_nft nn where nft_image is NULL AND nft_contract = '0x986aea67c7d6a15036e18678065eb663fc5be883'
        `)
        for (const nft of nfts) {
            console.log("DOing NFT", nft)
            await nft20.getNFT(
                nft.nft_contract,
                nft.nft_id
            )
        }

    } catch (error) {
      console.log("An error occured", error)
    }

})();
