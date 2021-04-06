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

const ethereum = new (require("../etl/utils/ethereum"))(
  process.env.NFT20_INFURA
);

var cors = require("cors");
var app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.get("/activity", async function (req, res) {
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

  let query = storage.knex.select("*").from("nft20_pool_view");
  req.query.nft ? query.where("nft", req.query.nft) : "";
  req.query.withLp ? query.where("lp_usd_balance", ">", 2000) : "";

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
          address: ethereum.normalizeHash(address),
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
  let listing_data = ethereum.w3.eth.abi.encodeParameters(
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
  const msgBufferHex = ethereum.w3.utils.sha3(listing_data)
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
      title:title,
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
    }
  }
})

// app.listen(7878);

module.exports = app;
