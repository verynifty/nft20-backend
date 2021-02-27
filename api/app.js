var express = require("express");
require('dotenv').config()

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
var Ddos = require('ddos')

var app = express();

var ddos = new Ddos({ burst: 200, limit: 35 })
app.use(ddos.express);

app.use(cors());

app.get('/activity', async function (req, res) {
  let currentPage = req.query.page != null ? parseInt(req.query.page) : 0;
  let query = storage.knex
    .select("*")
    .from("nft20_history")
  let result = await
    query.paginate({
      perPage: req.query.perPage ? parseInt(req.query.perPage) : 50,
      currentPage: currentPage ? currentPage : 0,
      isLengthAware: true,
    });
  res.status(200).json(result);
})

app.get('/pools', async function (req, res) {
  let currentPage = req.query.page != null ? parseInt(req.query.page) : 0;
  let query = storage.knex
    .select("*")
    .from("nft20_pool_view")
  let result = await
    query.paginate({
      perPage: req.query.perPage ? parseInt(req.query.perPage) : 50,
      currentPage: currentPage ? currentPage : 0,
      isLengthAware: true,
    });
  res.status(200).json(result);
})

app.get('/nfts', async function (req, res) {
  let currentPage = req.query.page != null ? parseInt(req.query.page) : 0;
  let query = null
  if (req.query.pool != null) {
    query = storage.knex
    .select("*")
    .from("nft20_nfts_view").where("pool", req.query.pool.toLowerCase())
  } else {
    query = storage.knex
    .select("*")
    .from("nft20_nfts_view")
  }
  let result = await
    query.paginate({
      perPage: req.query.perPage ? parseInt(req.query.perPage) : 50,
      currentPage: currentPage ? currentPage : 0,
      isLengthAware: true,
    });
  res.status(200).json(result);
})

app.listen(7878)
