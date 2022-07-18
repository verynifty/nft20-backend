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
        SELECT nft, id from nft20_action na left join nft20_nft nft on nft.nft_contract = na.nft and na.nft = '0x1b23d0f0f6dc3547c1b6945152acbfd6eaad85b0' and nft.nft_id = na.id where network = 0 and nft_image is null group by nft, id limit 1000
        `)
        console.log("GOT ", nfts.length)
        await sleep(1000)
        let i = 0;
        for (const nft of nfts) {
            console.log("DOing NFT", nft)
            await nft20.getNFT(
                nft.nft,
                nft.id
            )
            console.log("DONE", i++)
            await sleep(500)
        }

    } catch (error) {
      console.log("An error occured", error)
    }

})();
