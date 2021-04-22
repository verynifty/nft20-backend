const { Telegraf } = require("telegraf");

const bot = new Telegraf("r");
const axios = require("axios");
const ethereum = new (require("./utils/ethereum"))(
  "r"
);

const Discord = require("discord.js");
const webhookClient = new Discord.WebhookClient(
  "833516274951651349",
  "r")

// to format in case we need
// const embed = new Discord.MessageEmbed()
//   .setTitle("")
//   .setColor("#0099ff");

storage = new (require("./utils/storage"))({
  user: "doadmin",
  host: "verynifty-do-user-2688161-0.b.db.ondigitalocean.com",
  database: "verynifty",
  password: "hn7b5ac0d96g6hoc",
  port: 25061,
  ssl: true,
  ssl: { rejectUnauthorized: false },
});
const vnft = new (require("./utils/vnft"))(ethereum, storage);

const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

(async () => {
  try {
    msg =
      "#" +
      "1" +
      " " +
      "Enea" +
      " just got BONKED with a BOMB by '#'" +
      "2" +
      " " +
      "Adam" +
      " for " +
      "10" +
      " $ROYAL 🌟. ENEA's pet Dies in 2 Hours";

    // for testing
    webhookClient.send(msg, {
      username: "NFT BATTLES Bot",
      avatarURL:
        "https://pbs.twimg.com/profile_images/1360017205686136833/zdJYITbz_400x400.png",
      // embeds: [embed],
    });
    // for testing
    // bot.telegram.sendMessage(
    //   "-1001164170495", //"438453914", //"-1001164170495"
    //   msg
    // );
    let blockNumber = await ethereum.getLatestBlock();
    // blockNumber = "11381937"
    while (true) {
      let events = await vnft.getLatestBonks(blockNumber);
      for (const bonk of events) {
        let winner = await storage.get("vnft", "id", bonk.returnValues.winner);
        let loser = await storage.get("vnft", "id", bonk.returnValues.loser);
        let museWon = bonk.returnValues.museWon;
        let msg = "";
        let winnerName = winner.name;
        if (winnerName == null) {
          winnerName = "";
        }
        let loserName = loser.name;
        if (loserName == null) {
          loserName = "";
        }
        if (museWon == "0") {
          msg =
            "#" +
            loser.id +
            " " +
            loserName +
            " tried to attack '#'" +
            winner.id +
            " " +
            winnerName +
            " and got BONKED 😭🔨";
        } else {
          msg =
            "#" +
            loser.id +
            " " +
            loserName +
            " just got BONKED by '#'" +
            winner.id +
            " " +
            winnerName +
            " for " +
            museWon +
            " $muse 🌟🔨";
        }
        bot.telegram.sendMessage(
          "-1001164170495", //"438453914", //"-1001164170495"
          msg
        );

        webhookClient.send(msg, {
          username: "NFT BATTLES Bot",
          avatarURL:
            "https://pbs.twimg.com/profile_images/1360017205686136833/zdJYITbz_400x400.png",
          // embeds: [embed],
        });
        blockNumber = bonk.blockNumber + 1;
      }
      await sleep(10000);
    }
  } catch (error) {
    console.log(error);
  }
})();