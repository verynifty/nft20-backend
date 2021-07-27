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

router.get("/:owner", async function (req, res) {
  let petsOwned = await this.storage.knex
    .select("*")
    .from("cudl_pet")
    .where("owner", req.params.owner.toLowerCase());

  let careTaking = await this.storage.knex
    .select("*")
    .from("cudl_pet")
    .where("caretaker", req.params.address.toLowerCase());

  pets.concat(careTaking);
  res.status(200).json({
    pets,
  });
});

router.get("/leaderboard", async function (req, res) {
  let leaderboard = await this.storage.knex
    .select("*")
    .from("cudl_pet")
    .where("is_alive", true)
    .orderBy("score", "DESC");
  let grumpy = await this.storage.knex
    .select("*")
    .from("cudl_pet")
    .where("is_alive", true)
    .where("tod", "<", this.storage.knex.fn.now())
    .orderBy("score", "DESC");
  res.status(200).json({
    leaderboard: leaderboard,
    grumpy: grumpy,
  });
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
  let pet = await this.storage.knex
    .select("*")
    .from("cudl_pet")
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
    .from("cudl_pet")
    .where("caretaker", req.params.address.toLowerCase());

  res.status(200).json({
    pet,
  });
});

module.exports = router;
