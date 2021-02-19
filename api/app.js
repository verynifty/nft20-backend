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

var ddos = new Ddos({burst:200, limit:35})
app.use(ddos.express);

app.use(cors());

app.get('/activity', async function (req, res) {
    let currentPage = req.params.page != null ? parseInt(req.params.page) : 0;
    let query = storage.knex
    .select("*")
    .from("nft20_action")
    .orderBy("blocknumber", "desc")
    let result = await
    query.paginate({
      perPage: req.query.perPage ? parseInt(req.query.perPage) : 50,
      currentPage: currentPage != null ,
      isLengthAware: true,
    });
  res.status(200).json(result);
})

app.listen(7878)