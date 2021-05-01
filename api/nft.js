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

function getChainID(net = null) {
    let network = net != null ? parseInt(net) : 0;
    if (network == 0) {
        return 1;
    }
    else if (network == 1) {
        return 80001;
    }
}

app.get("/contract/:contract/:user/", async function (req, res) {
    let network = getChainID(req.query.network)
    let result = await Axios.get("https://api.covalenthq.com/v1/" + network + "/address/" + req.params.user + "/balances_v2/?nft=true",
    {
        auth: {
            user: process.env.COVALENT_KEY
        }
    })
    let r = []
    console.log(result.data.data.items)
    for (const it of result.data.data.items) {
        if (it.contract_address.toLowerCase() == req.params.contract.toLowerCase()) {
            for (const n of it.nft_data) {
                console.log(n)
                let nft = {
                    nft_contract:  req.params.contract.toLowerCase(),
                    nft_id: n.token_id,
                    nft_title: n.external_data.name,
                    nft_description: n.external_data.description,
                    nft_image: n.external_data.image,
                    nft_original_image: n.external_data.image,
                    nft_trait: JSON.stringify(n.external_data.attributes)
                }
                console.log(nft)
                r.push(nft)
            }
        }
    }
    console.log()

})


app.listen(7878);

//module.exports = app;
