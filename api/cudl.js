var express = require("express");
var router = express.Router();

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

//const cudl = new (require("../etl/utils/cudl"))(ethereum_insance, storage);

router.get("/owner/:owner", async function (req, res) {
  let petsOwned = await this.storage.knex
    .select("*")
    .from("cudl_pet")
    .where("owner", req.params.owner.toLowerCase())
    .where("is_alive", req.query.dead ? false : true);

  let careTaking = await this.storage.knex
    .select("*")
    .from("cudl_pet")
    .where("caretaker", req.params.owner.toLowerCase())
    .where("is_alive", true);

  let dead = await this.storage.knex
    .select("*")
    .from("cudl_pet")
    .where("caretaker", req.params.owner.toLowerCase())
    .where("is_alive", false);

  if (req.query.refresh) {
    for (const pet of petsOwned) {
     // await cudl.updatePet(pet.pet_id);
    }
  }

  //   petsOwned.concat(careTaking);
  res.status(200).json({
    petsOwned,
    careTaking,
    dead
  });
});


router.get("/leaderboard", async function (req, res) {
  let leaderboard = await this.storage.knex
    .select("*")
    .from("cudl_pet_view")
    .where("is_alive", true)
    .orderBy("score", "DESC");
  let grumpy = await this.storage.knex
    .select("*")
    .from("cudl_pet_view")
    .where("is_starving", true)
    .where("is_alive", true)
    .where("tod", "<", this.storage.knex.fn.now())
    .orderBy("score", "DESC");
  res.status(200).json({
    leaderboard: leaderboard,
    grumpy: grumpy
  });
});

router.get("/upcoming", async function (req, res) {
  let upcoming = await this.storage.knex
    .select("*")
    .from("cudl_pet_view")
    .where("is_alive", true)
    .orderBy("tod", "ASC");
  res.status(200).json(upcoming);
});

router.get("/bonks", async function (req, res) {
  let bonks = await this.storage.knex
    .select("*")
    .from("cudl_bonk")
    .orderBy("timestamp", "DESC");
  res.status(200).json({
    bonks: bonks,
  });
});

router.get("/:id", async function (req, res) {
  if (req.query.refresh) {
    await cudl.updatePet(req.params.id);
  }
  let pet = await this.storage.knex
    .select("*")
    .from("cudl_pet_view")
    .where("pet_id", req.params.id);
  res.status(200).json({
    pet,
  });
});

router.get("/ingame", async function (req, res) {
  let pet = await this.storage.knex
    .select("*")
    .from("cudl_pet")
    .where("nft_id", parseInt(req.query.id))
    .where("nft_contract", req.query.contract.toLowerCase());

  if (pet.length > 0) {
    res.status(200).json({ result: true });
  } else {
    res.status(200).json({ result: false });
  }
});

router.get("/caretaking/:address", async function (req, res) {
  let pet = await this.storage.knex
    .select("*")
    .from("cudl_pet_view")
    .where("caretaker", req.params.address.toLowerCase());

  res.status(200).json({
    pet,
  });
});

module.exports = router;
