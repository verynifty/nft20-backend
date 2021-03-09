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

app.listen(7878);

module.exports = app;
