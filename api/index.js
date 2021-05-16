var express = require("express");
require("dotenv").config();
const { recoverPersonalSignature } = require("eth-sig-util");
const { bufferToHex } = require("ethereumjs-util");

const { default: Axios } = require("axios");

storage = new (require("../etl/utils/storage"))({
  user: process.env.NFT20_DB_USER,
  host: process.env.NFT20_DB_HOST,
  database: "verynifty",
  password: process.env.NFT20_DB_PASSWORD,
  port: 25061,
  ssl: true,
  ssl: { rejectUnauthorized: false },
});

ethereum_insance = new (require("../etl/utils/ethereum"))(
  process.env.NFT20_INFURA
);
/*
matic = new (require("../etl/utils/ethereum_insance"))(
  process.env.NFT20_MATIC
);  
*/

//const ERC1155ABI = require("../../contracts/ERC1155.abi");

const nft20 = new (require("../etl/utils/nft20"))(
  ethereum_insance,
  storage
)

var cors = require("cors");
var app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.get("/activity", async function (req, res) {
  let network = req.query.network;
  let currentPage = req.query.page != null ? parseInt(req.query.page) : 0;
  let query = storage.knex.select("*").from("nft20_history");
  if (req.query.user) {
    query.where("user", req.query.user);
  }
  if (req.query.nft) {
    query.where("address", req.query.address);
  }
  if (req.query.pool) {
    query.where("nft", req.query.nft);
  }
  if (network) {
    query.where("network", network)
  }
  query.orderBy("timestamp", "desc");
  let result = await query.paginate({
    perPage: req.query.perPage ? parseInt(req.query.perPage) : 50,
    currentPage: currentPage ? currentPage : 0,
    isLengthAware: true,
  });
  res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
  res.status(200).json(result);
});

app.get("/pools", async function (req, res) {
  let currentPage = req.query.page != null ? parseInt(req.query.page) : 0;
  let network = req.query.network != null ? parseInt(req.query.network) : 0;

  let query = storage.knex.select("*").from("nft20_pool_view");
  req.query.nft ? query.where("nft", req.query.nft) : "";
  req.query.withLp ? query.where("lp_usd_balance", ">", 2000) : "";
  query.where("network", network)

  let result = await query.paginate({
    perPage: req.query.perPage ? parseInt(req.query.perPage) : 50,
    currentPage: currentPage ? currentPage : 0,
    isLengthAware: true,
  });
  res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
  res.status(200).json(result);
});

app.get("/nfts", async function (req, res) {
  let currentPage = req.query.page != null ? parseInt(req.query.page) : 0;
  let network = req.query.network != null ? parseInt(req.query.network) : 0;

  let query = null;
  if (req.query.pool != null) {
    query = storage.knex
      .select("*")
      .from("nft20_nfts_view")
      .where("pool", req.query.pool.toLowerCase())
      .where("availabe_quantity", ">", 0);
  } else {
    query = storage.knex.select("*").from("nft20_nfts_view");
  }
  let result = await query.paginate({
    perPage: req.query.perPage ? parseInt(req.query.perPage) : 50,
    currentPage: currentPage ? currentPage : 0,
    isLengthAware: true,
  });
  res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
  res.status(200).json(result);
});

app.get("/gallery", async function (req, res) {
  let network = req.query.network != null ? parseInt(req.query.network) : 0;
  let currentPage = req.query.page != null ? parseInt(req.query.page) : 0;
  let query = null;
  if (req.query.pool != null) {
    query = storage.knex.select("*").from("nft20_nfts_view");
  } else {
    query = storage.knex.select("*").from("nft20_nfts_view");
  }
  let result = await query.paginate({
    perPage: req.query.perPage ? parseInt(req.query.perPage) : 500,
    currentPage: currentPage ? currentPage : 0,
    isLengthAware: true,
  });
  res.setHeader("Cache-Control", "s-max-age=600, stale-while-revalidate");
  res.status(200).json(result);
});

app.get("/status", async function (req, res) {
  let publicAddress = req.query.publicAddress;
  let name = publicAddress;
  if (publicAddress != null) {
  }
  res.status(200).json({
    name: name,
    publicAddress: publicAddress,
  });
});

app.get("/wcat/:id", async function (req, res) {
  let id = parseInt(req.params.id);
  if (id >= 0 && id <= 624) {
    res.status(200).json(
      {
        "description": "A wrapped CryptoCat.",
        "external_url": `https://cryptocats.thetwentysix.io/#cbp=cats/${id}.html`,
        "image": `https://cryptocats.thetwentysix.io/contents/images/cats/${id}.png`,
        "name": `wCrypto Cat ${id}`,
        "attributes": [
        ]
      }
    )
  }
  else {
    res.status(400).send("cat not found");
  }
});

app.get("/nfttopool/:nft", async function (req, res) {
  let currentPage = req.query.page != null ? parseInt(req.query.page) : 0;
  let network = req.query.network != null ? parseInt(req.query.network) : 0;

  let query = storage.knex
    .select("address")
    .from("nft20_pool_view")
    .where("nft", req.params.nft);

  let result = await query.paginate({
    perPage: req.query.perPage ? parseInt(req.query.perPage) : 50,
    currentPage: currentPage ? currentPage : 0,
    isLengthAware: true,
  });

  res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
  res.status(200).json(result);
});

app.get("/auctions", async function (req, res) {
  let currentPage = req.query.page != null ? parseInt(req.query.page) : 0;
  let query = storage.knex.select("*").from("nft20_auctions").orderBy('auction_id', 'desc');
  if (req.query.pair != null) {
    query = storage.knex.select("*").where("pair", req.query.pair.toLowerCase()).from("nft20_auctions").orderBy('auction_id', 'desc');
  }
  let result = await query.paginate({
    perPage: req.query.perPage ? parseInt(req.query.perPage) : 100,
    currentPage: currentPage ? currentPage : 0,
    isLengthAware: true,
  });
  res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
  res.status(200).json(result);
});

app.get("/leaderboard", async function (req, res) {
  let currentPage = req.query.page != null ? parseInt(req.query.page) : 0;

  let query = storage.knex.select(['name', 'address', 'score', 'avatar']).from("nft20_score").orderBy('score', 'desc');


  let result = await query.paginate({
    perPage: req.query.perPage ? parseInt(req.query.perPage) : 50,
    currentPage: currentPage ? currentPage : 0,
    isLengthAware: true,
  });
  res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
  res.status(200).json(result);
});


app.post("/name", async function (req, res) {
  const name = req.body.name;
  const signature = req.body.signature;
  const publicAddress = req.body.publicAddress;
  try {
    const msg = name || "0x";

    const msgBufferHex = bufferToHex(Buffer.from(msg, "utf8"));
    const address = recoverPersonalSignature({
      data: msgBufferHex,
      sig: signature,
    });

    if (address.toLowerCase() === publicAddress.toLowerCase()) {
      const updateName = await storage
        .knex("nft20_user")
        .insert({
          address: ethereum_insance.normalizeHash(address),
          name: name,
        })
        .onConflict("address")
        .merge();

      res.status(200).json({
        name: name,
        publicAddress: publicAddress,
      });
    } else {
      res.status(200).send("Signature don't match.");
    }
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

app.get("/irdrap/:address", async function (req, res) {
  let airdrop = await storage.getMulti("game_airdrop", {
    address: req.params.address.toLowerCase()
  })
  res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
  res.status(200).json(airdrop);
})

app.post("/collection", async function (req, res) {
  for (const collection of req.body.collections) {
    await this.storage.insert("nft20_collection", collection);
  }
});

app.get("/list/listing/:id", async function (req, res) {
  let listing = await storage.getMulti("listing_view", {
    id: req.params.id
  })
  res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
  res.status(200).json(listing);
})

app.get("/list/list", async function (req, res) {
  let currentPage = req.query.page != null ? parseInt(req.query.page) : 0;
  let query = null;
  if (req.query.contract_address != null) {
    query = storage.knex
      .select("*")
      .from("listing_view")
      .where("cancelled", false)
      .where("sold", false).whereRaw('? ~ ANY(contracts)', [req.query.contract_address])
  } else {
    query = storage.knex
      .select("*")
      .from("listing_view")
      .where("cancelled", false)
      .where("sold", false)
  }
  let result = await query.paginate({
    perPage: req.query.perPage ? parseInt(req.query.perPage) : 50,
    currentPage: currentPage ? currentPage : 0,
    isLengthAware: true,
  });
  res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
  res.status(200).json(result);
})

app.post("/list/new", async function (req, res) {
  const title = req.body.title;
  const description = req.body.description;
  const signature = req.body.signature;
  const author = req.body.author;
  const token_amount = req.body.token_amount;
  const nfts = req.body.nfts;
  const nonce = req.body.nonce;
  let nfts_contract = []
  let nfts_id = []
  let nfts_amount = []
  for (const nft of nfts) {
    nfts_contract.push(nft.contract_address);
    nfts_id.push(nft.id);
    nfts_amount.push(nft.quantity);
  }
  let listing_data = ethereum_insance.w3.eth.abi.encodeParameters(
    [
      "uint256",
      "address",
      "address[]",
      "uint256[]",
      " uint256[]",
      "uint256"
    ],
    [
      nonce,
      author,
      nfts_contract,
      nfts_id,
      nfts_amount,
      token_amount
    ])
  const msgBufferHex = ethereum_insance.w3.utils.sha3(listing_data)
  const address = recoverPersonalSignature({
    data: msgBufferHex,
    sig: signature,
  });
  console.log(req.body)
  console.log("SHA3", msgBufferHex)
  console.log(address.toLowerCase(), author.toLowerCase())
  if (address.toLowerCase() == author.toLowerCase()) {
    console.log("Signatures are matching")
    await storage.insert("list_listing", {
      title: title,
      description: description,
      author: author,
      id: msgBufferHex,
      signed: signature,
      nonce: nonce,
      token_price: token_amount
    })
    for (let index = 0; index < nfts.length; index++) {
      const nft = nfts[index];
      await storage.insert("list_listing_elem", {
        listing_id: msgBufferHex,
        nft_contract: nft.contract_address,
        nft_id: nft.id,
        nft_amount: nft.quantity,
        nonce: index
      })
      await nft20.getNFT(nft.contract_address, nft.id)
    }
  }
})

/**
 * GAME API
 */


app.get("/game/leaderboard", async function (req, res) {
  let currentPage = req.query.page != null ? parseInt(req.query.page) : 0;
  let query = storage.knex
    .select("*")
    .from("game_players_view")
    .whereNotNull("time_born").whereRaw("tod > NOW()").orderBy("time_born", "ASC")
  let result = await query.paginate({
    perPage: req.query.perPage ? parseInt(req.query.perPage) : 500,
    currentPage: currentPage ? currentPage : 0,
    isLengthAware: true,
  });
  res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
  res.status(200).json(result.data);
});

app.get("/game/deathvalley", async function (req, res) {
  let currentPage = req.query.page != null ? parseInt(req.query.page) : 0;
  let query = storage.knex
    .select("*")
    .from("game_players_view")
    .whereNotNull("time_born").whereRaw("tod <= NOW()").orderBy("time_born", "ASC")
  let result = await query.paginate({
    perPage: req.query.perPage ? parseInt(req.query.perPage) : 500,
    currentPage: currentPage ? currentPage : 0,
    isLengthAware: true,
  });
  res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
  res.status(200).json(result.data);
});

app.get("/game/player/:id", async function (req, res) {
  let currentPage = req.query.page != null ? parseInt(req.query.page) : 0;
  let result = await this.storage.getMulti("game_players_view", { "player_id": req.params.id })
  res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
  res.status(200).json(result);
});

app.get("/game/user/:owner", async function (req, res) {
  let currentPage = req.query.page != null ? parseInt(req.query.page) : 0;
  let query = storage.knex
    .select("*")
    .from("game_players_view")
    .where("owner", req.params.owner.toLowerCase()).orderBy("time_born", "ASC")
  let result = await query.paginate({
    perPage: req.query.perPage ? parseInt(req.query.perPage) : 500,
    currentPage: currentPage ? currentPage : 0,
    isLengthAware: true,
  });
  res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
  res.status(200).json(result.data);
});

app.get("/game/dead", async function (req, res) {
  let currentPage = req.query.page != null ? parseInt(req.query.page) : 0;
  let query = storage.knex
    .select("*")
    .from("game_players_view")
    .where("time_born", null).orderBy("time_born", "ASC")
  let result = await query.paginate({
    perPage: req.query.perPage ? parseInt(req.query.perPage) : 500,
    currentPage: currentPage ? currentPage : 0,
    isLengthAware: true,
  });
  res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
  res.status(200).json(result.data);
});


/* NFT API */


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
  let res2 = await Axios.post('https://api.thegraph.com/subgraphs/name/dievardump/matic-nfts', {
    query: `
    {
      accounts(where: {id: "` + address.toLowerCase() + `"}) {
        tokens {
          token {
            tokenId
          }
          registry {
            id
          }
        }
      }
    }  
      `
  })
  let nfts =  res.data.data.accounts.tokens
  for (const n of nfts) {
    result.push({
      contract_address: nft.registry.id,
      nft_id: nft.token.tokenId,
      amount: 1
    })
  }
  return (result)
}

app.get("/nft/matic/user/:user/", async function (req, res) {
  let NFTs = await getMNFTFromUser(req.params.user);
  if (req.query.contract_address != null) {
    NFTs = NFTs.filter(NFT => NFT.contract_address == req.query.contract_address.toLowerCase())
  }
  res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
  res.status(200).json(NFTs);
})

app.post('/nft/matic/new', async function (req, res) {
  for (const nft of req.body.nfts) {
    let existing = await this.storage.getMulti("nft20_nft", {
      nft_contract: nft.nft_contract,
      nft_id: nft.nft_id,
    });
    if (existing && existing.nft_image == null) { //UPDATE
      await this.storage.updateMulti("nft20_nft", {
        nft_contract: nft.nft_contract,
        nft_id: nft.nft_id,
      }, nft)
    } else { //INSERT
      await this.storage.insert("nft20_nft", nft)
    }
  }
  res.status(200).json(true);
})



// app.listen(7878);

module.exports = app;
