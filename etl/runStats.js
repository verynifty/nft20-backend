require('dotenv').config()
let network = process.env.NETWORK == null ? 0 : parseInt(process.env.NETWORK)

const ethereum = new (require("./utils/ethereum"))(
  network == 0 ? process.env.NFT20_INFURA : process.env.NFT20_MATIC
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


const os = new (require("./utils/os_client"))(storage);

const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

(async () => {
  while (true) {
    try {
      await os.getStats();
    } catch (error) {
      console.log("An error occured", error)
    }
    await sleep(70000);
  }
})();
