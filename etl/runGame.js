require('dotenv').config()

const ethereum = new (require("./utils/ethereum"))(
  //process.env.NFT20_INFURA
    "https://rinkeby.infura.io/v3/412acf21edf5444a8c9f6bd737cf8ca3"
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
let Game = require("./utils/game")
const game = new Game(ethereum, storage);

const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

(async () => {
  while (true) {
    try {
      await nft20.run();
    } catch (error) {
      console.log("An error occured", error)
    }
    await sleep(60000);
  }
})();
