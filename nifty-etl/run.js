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
const vnft = new (require("./utils/vnft"))(ethereum, storage);

const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

(async () => {
  while (true) {
    await vnft.verifyAddons();
    await sleep(1000);
    break;
  }
})();
