var express = require("express");
require("dotenv").config();
const { recoverPersonalSignature } = require("eth-sig-util");
const { bufferToHex } = require("ethereumjs-util");

storage = new (require("../etl/utils/storage"))({
  user: process.env.NFT20_DB_USER,
  host: process.env.NFT20_DB_HOST,
  database: "verynifty",
  password: process.env.NFT20_DB_PASSWORD,
  port: 25061,
  ssl: true,
  ssl: { rejectUnauthorized: false },
});


var cors = require("cors");
const { default: Axios } = require("axios");
var app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());


async function getMNFTFromUser(address) {
    let res = await Axios.post('https://api.thegraph.com/subgraphs/name/grandsmarquis/erc1155matic', {
        query: `
        {
            balances (where: {account: "` + address.toLowerCase() + `"}) {
              id
            value
            token {
              identifier
              registry {
                id
              }
            }
            }
        }
        
        `
      })
      let result = []
      let balances = res.data.data.balances
      for (const balance of balances) {
          result.push({
            contract_address: balance.token.registry.id,
            nft_id: balance.token.identifier,
            amount: balance.value
          })
      }
      return (result)
}

app.get("/matic/user/:user/", async function (req, res) {
  let NFTs = await getMNFTFromUser(req.params.user);
  if (req.query.contract_address != null) {
      NFTs = NFTs.filter(NFT => NFT.contract_address == req.query.contract_address.toLowerCase())
  }
  res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
  res.status(200).json(NFTs);
})


app.listen(7878);

//module.exports = app;
