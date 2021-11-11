var express = require("express");
require("dotenv").config();
const { recoverPersonalSignature } = require("eth-sig-util");
const { bufferToHex } = require("ethereumjs-util");

const { default: Axios } = require("axios");

var cudlRouter = require("./cudl");

storage = new (require("../etl/utils/storage"))({
  user: process.env.NFT20_DB_USER,
  host: process.env.NFT20_DB_HOST,
  database: "verynifty",
  password: process.env.NFT20_DB_PASSWORD,
  port: 25061,
  ssl: true,
  ssl: { rejectUnauthorized: false },
});

const os = new (require("../etl/utils/os_client"))(storage);

ethereum_insance = new (require("../etl/utils/ethereum"))(
  process.env.NFT20_INFURA
);
/*
matic = new (require("../etl/utils/ethereum_insance"))(
  process.env.NFT20_MATIC
);  
*/

//const ERC1155ABI = require("../../contracts/ERC1155.abi");

const nft20 = new (require("../etl/utils/nft20"))(ethereum_insance, storage);

var cors = require("cors");
var app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.use("/cudl", cudlRouter);

app.get("/activity", async function (req, res) {
  let network = req.query.network;
  let currentPage = req.query.page != null ? parseInt(req.query.page) : 0;
  let query = storage.knex.select("*").from("nft20_history");
  if (req.query.user) {
    query.where("user", req.query.user.toLowerCase());
  }
  if (req.query.pool) {
    query.where("address", req.query.pool.toLowerCase());
  }
  if (req.query.nft) {
    query.where("nft", req.query.nft.toLowerCase());
  }
  if (network) {
    query.where("network", network);
  }
  query.orderBy("timestamp", "desc");
  let result = await query.paginate({
    perPage: req.query.perPage ? parseInt(req.query.perPage) : 50,
    currentPage: currentPage ? currentPage : 0,
    isLengthAware: true,
  });
  res.setHeader("Cache-Control", "s-max-age=240, stale-while-revalidate");
  res.status(200).json(result);
});

app.get("/pools", async function (req, res) {
  if (req.query.nft != null) {
    res.status(200).json({
      "hey": "You're calling the api in a terrible way. contact us on discord or we'll block you"
    });
    return;
  }
  let currentPage = req.query.page != null ? parseInt(req.query.page) : 0;
  let network = req.query.network != null ? parseInt(req.query.network) : 0;

  let query = storage.knex.select("*").from("nft20_pool_view");
  req.query.nft ? query.where("nft", req.query.nft.toLocaleLowerCase()) : "";
  req.query.withLp ? query.where("lp_usd_balance", ">", 2000) : "";
  req.query.pool
    ? query.where("address", req.query.pool.toLocaleLowerCase())
    : "";

  query.where("network", network);

  let result = await query.paginate({
    perPage: req.query.perPage ? parseInt(req.query.perPage) : 5000,
    currentPage: currentPage ? currentPage : 0,
    isLengthAware: true,
  });
  res.setHeader("Cache-Control", "s-max-age=120, stale-while-revalidate");
  res.status(200).json(result);
});

app.get("/nft/:contract/:id", async function (req, res) {
  let nft = await storage.getMulti("nft20_nft", {
    nft_contract: req.params.contract,
    nft_id: req.params.id,
  });
  let collection = await storage.getMulti("nft20_collection", {
    contract_address: req.params.contract,
  });
  res.setHeader("Cache-Control", "s-max-age=300, stale-while-revalidate");
  // TODO Do something if none exist
  res.status(200).json({
    nft: nft,
    collection: collection,
  });
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
  } else if (req.query.nft != null) {
    query = storage.knex
      .select("*")
      .from("nft20_nfts_view")
      .where("nft_contract", req.query.nft.toLowerCase())
      .where("availabe_quantity", ">", 0);
  } else {
    query = storage.knex.select("*").from("nft20_nfts_view");
  }
  let result = await query.paginate({
    perPage: req.query.perPage ? parseInt(req.query.perPage) : 5000,
    currentPage: currentPage ? currentPage : 0,
    isLengthAware: true,
  });
  res.setHeader("Cache-Control", "s-max-age=240, stale-while-revalidate");
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
    res.status(200).json({
      description: "A wrapped CryptoCat.",
      external_url: `https://cryptocats.thetwentysix.io/#cbp=cats/${id}.html`,
      image: `https://cryptocats.thetwentysix.io/contents/images/cats/${id}.png`,
      name: `wCrypto Cat ${id}`,
      attributes: [],
    });
  } else {
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
  let query = storage.knex
    .select("*")
    .from("nft20_auctions")
    .orderBy("auction_id", "desc");
  if (req.query.pair != null) {
    query = storage.knex
      .select("*")
      .where("pair", req.query.pair.toLowerCase())
      .from("nft20_auctions")
      .orderBy("auction_id", "desc");
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

  let query = storage.knex
    .select(["name", "address", "score", "avatar"])
    .from("nft20_score")
    .orderBy("score", "desc");

  let result = await query.paginate({
    perPage: req.query.perPage ? parseInt(req.query.perPage) : 50,
    currentPage: currentPage ? currentPage : 0,
    isLengthAware: true,
  });
  res.setHeader("Cache-Control", "s-max-age=240, stale-while-revalidate");
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

app.post("/collection", async function (req, res) {
  for (const collection of req.body.collections) {
    await this.storage.insert("nft20_collection", collection);
  }
});

app.get("/list/listing/:id", async function (req, res) {
  let listing = await storage.getMulti("listing_view", {
    id: req.params.id,
  });
  res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
  res.status(200).json(listing);
});

app.get("/list/collections", async function (req, res) {
  let result = await storage.executeAsync(`SELECT 
  collection_name,
  nc.collection_description ,
  nc.collection_type,
  nc.image_url ,
  nc.external_url ,
  nc.contract_address ,
  count(*) as number_of_items
  FROM list_listing_elem elem,
  nft20_collection nc
   WHERE elem.nft_contract = nc.contract_address 
  group by    collection_name,
  nc.collection_description ,
  nc.collection_type,
  nc.image_url ,
  nc.external_url,
  nc.contract_address 
  ORDER by number_of_items DESC`); // @TODO Move this to a view?
  res.setHeader("Cache-Control", "s-max-age=500, stale-while-revalidate");
  res.status(200).json({ collections: result });
});

app.get("/nft20/webhooks", async function (req, res) {
  let result = await storage.executeAsync(`SELECT * FROM nft20_webhooks`);
  res.setHeader("Cache-Control", "s-max-age=500, stale-while-revalidate");
  res.status(200).json(result);
});

app.get("/list/list", async function (req, res) {
  let currentPage = req.query.page != null ? parseInt(req.query.page) : 0;
  let query = null;
  if (req.query.contract_address != null) {
    query = storage.knex
      .select("*")
      .from("listing_view")
      .where("cancelled", false)
      .where("sold", false)
      .whereRaw("? ~ ANY(contracts)", [req.query.contract_address]);
  } else {
    query = storage.knex
      .select("*")
      .from("listing_view")
      .where("cancelled", false)
      .where("sold", false);
  }
  let result = await query.paginate({
    perPage: req.query.perPage ? parseInt(req.query.perPage) : 50,
    currentPage: currentPage ? currentPage : 0,
    isLengthAware: true,
  });
  res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
  res.status(200).json(result);
});

app.post("/list/new", async function (req, res) {
  const title = req.body.title;
  const description = req.body.description;
  const signature = req.body.signature;
  const author = req.body.author;
  const token_amount = req.body.token_amount;
  const nfts = req.body.nfts;
  const expiry_time = req.body.expiry_time;
  if (title.length < 1) {
    res.status(200).json({
      error: "Title is empty.",
    });
    return;
  }
  let nfts_contract = [];
  let nfts_id = [];
  let nfts_amount = [];
  for (const nft of nfts) {
    nfts_contract.push(nft.contract_address);
    nfts_id.push(nft.id);
    nfts_amount.push(nft.quantity);
  }
  if (nfts_contract.length < 1) {
    res.status(200).json({
      error: "You need to add at least one NFT.",
    });
    return;
  }
  let listing_data = ethereum_insance.w3.eth.abi.encodeParameters(
    ["address", "address[]", "uint256[]", "uint256[]", "uint256", "uint256"],
    [author, nfts_contract, nfts_id, nfts_amount, token_amount, expiry_time]
  );
  const msgBufferHex = ethereum_insance.w3.utils.sha3(listing_data);
  const address = recoverPersonalSignature({
    data: msgBufferHex,
    sig: signature,
  });
  if (address.toLowerCase() == author.toLowerCase()) {
    await storage.insert("list_listing", {
      title: title,
      description: description,
      author: author,
      id: msgBufferHex,
      signed: signature,
      nonce: 0,
      token_price: token_amount,
      expiry_time: new Date(parseInt(expiry_time * 1000)).toUTCString(),
    });
    for (let index = 0; index < nfts.length; index++) {
      const nft = nfts[index];
      await storage.insert("list_listing_elem", {
        listing_id: msgBufferHex,
        nft_contract: nft.contract_address,
        nft_id: nft.id,
        nft_amount: nft.quantity,
        nonce: index,
      });
      await nft20.getNFT(nft.contract_address, nft.id);
    }
    res.status(200).json({ msgBufferHex });
    return; // This is ok
  } else {
    res.status(200).json({
      error: "Signature doesn't match.",
    });
  }
});

/**
 * GAME API
 */

app.get("/game/leaderboard", async function (req, res) {
  let currentPage = req.query.page != null ? parseInt(req.query.page) : 0;
  let query = storage.knex
    .select("*")
    .from("game_players_view")
    .whereNotNull("time_born")
    .whereRaw("tod > NOW()")
    .orderBy("time_born", "ASC");
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
    .whereNotNull("time_born")
    .whereRaw("tod <= NOW()")
    .orderBy("time_born", "ASC");
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
  let result = await this.storage.getMulti("game_players_view", {
    player_id: req.params.id,
  });
  res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
  res.status(200).json(result);
});

app.get("/game/user/:owner", async function (req, res) {
  let currentPage = req.query.page != null ? parseInt(req.query.page) : 0;
  let query = storage.knex
    .select("*")
    .from("game_players_view")
    .where("owner", req.params.owner.toLowerCase())
    .orderBy("time_born", "ASC");
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
    .where("time_born", null)
    .orderBy("time_born", "ASC");
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
  let res = await Axios.post(
    "https://api.thegraph.com/subgraphs/name/grandsmarquis/erc1155matic",
    {
      query:
        `
      {
          balances (where: {account: "` +
        address.toLowerCase() +
        `"}) {
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
      
      `,
    }
  );
  let result = [];
  let balances = res.data.data.balances;
  for (const balance of balances) {
    result.push({
      contract_address: balance.token.registry.id,
      nft_id: balance.token.identifier,
      amount: balance.value,
      type: 1155,
    });
  }
  let res2 = await Axios.post(
    "https://api.thegraph.com/subgraphs/name/dievardump/matic-nfts",
    {
      query:
        `
    {
      accounts(where: {id: "` +
        address.toLowerCase() +
        `"}) {
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
      `,
    }
  );
  try {
    let nfts = res2.data.data.accounts[0].tokens;
    for (const nft of nfts) {
      result.push({
        contract_address: nft.registry.id,
        nft_id: nft.token.tokenId,
        amount: 1,
        type: 721,
      });
    }
  } catch (error) {}

  return result;
}

app.get("/nft/list/", async function (req, res) {
  let result = await os.getNFTs(
    req.query.address,
    req.query.chain,
    req.query.collection
  );
  res.setHeader("Cache-Control", "s-max-age=200, stale-while-revalidate");
  res.status(200).json(result);
});

app.get("/nft/matic/user/:user/", async function (req, res) {
  let NFTs = await getMNFTFromUser(req.params.user);
  if (req.query.contract_address != null) {
    NFTs = NFTs.filter(
      (NFT) => NFT.contract_address == req.query.contract_address.toLowerCase()
    );
  }
  res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
  res.status(200).json(NFTs);
});

app.post("/nft/matic/new", async function (req, res) {
  for (const nft of req.body.nfts) {
    let existing = await this.storage.getMulti("nft20_nft", {
      nft_contract: nft.nft_contract,
      nft_id: nft.nft_id,
    });
    if (existing && existing.nft_image == null) {
      //UPDATE
      await this.storage.updateMulti(
        "nft20_nft",
        {
          nft_contract: nft.nft_contract,
          nft_id: nft.nft_id,
        },
        nft
      );
    } else {
      //INSERT
      await this.storage.insert("nft20_nft", nft);
    }
  }
  res.status(200).json(true);
});

app.get("/user/leaderboard", async function (req, res) {
  let result = await storage.executeAsync(`SELECT
  "from" AS "user", 
  count(*) AS "count",
   sum(CASE WHEN "public"."nft20_history"."type" = 'Withdraw' THEN 1 ELSE 0 END) AS "buys", 
   sum(CASE WHEN "public"."nft20_history"."type" = 'Deposit' THEN 1 ELSE 0 END) AS "sells",
    sum(CASE WHEN "public"."nft20_history"."type" = 'Swap' THEN 1 ELSE 0 END) AS "swaps",
     sum("public"."nft20_history"."volume_eth") AS "volume_eth",
      sum("public"."nft20_history"."volume_usd") AS "volume_usd",
      sum("public"."nft20_history"."total_transfers") AS "nft_traded",
       count(distinct "nft20_pair__via__pool"."address") AS "pools_interacted_with",
        max("public"."nft20_history"."volume_eth") AS "biggest_trade",
         avg("public"."nft20_history"."volume_usd") AS "average_trade"
  FROM "public"."nft20_history"
  LEFT JOIN "public"."nft20_pair" "nft20_pair__via__pool" ON "public"."nft20_history"."pool" = "nft20_pair__via__pool"."address"
  group by "from"
  ORDER BY 4 DESC
  `); // @TODO Move this to a view?
  res.setHeader("Cache-Control", "s-max-age=5000, stale-while-revalidate");
  res.status(200).json(result);
});

app.post("/pepeswantstovote", async function (req, res) {
  let address = req.body.address;
  let nft_address = req.body.nft_address;
  let pool = req.body.pool;
  const signature = req.body.sig;
  const msg = address + pool + nft_address || "0x";
  const msgBufferHex = bufferToHex(Buffer.from(msg, "utf8"));
  const p_address = recoverPersonalSignature({
    data: msgBufferHex,
    sig: req.body.sig,
  });
  if (p_address.toLowerCase() != address.toLowerCase()) {
    res
      .status(200)
      .json([p_address.toLowerCase(), address.toLowerCase(), false]);
    return;
  }
  let score = req.body.isHappy ? +1 : -1;
  await this.storage.insert("pepevote", {
    address: address.toLowerCase(),
    amount: score,
    time: storage.knex.fn.now(),
    nft_address: nft_address.toLowerCase(),
  });
  res.status(200).json(true);
});

app.get("/price/hour", async function (req, res) {
  let data = await this.storage.knex
    .select("*")
    .from("nft20_price_feed_hour_view")
    .where("nft_address", req.query.address.toLowerCase());
  res.status(200).json(data);
});

app.get("/price/day", async function (req, res) {
  let data = await this.storage.knex
    .select("*")
    .from("nft20_price_feed_day_view")
    .where("nft_address", req.query.address.toLowerCase());
  res.status(200).json(data);
});

app.listen(7878);

module.exports = app;
