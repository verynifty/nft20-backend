require('dotenv').config()

const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.GAME_TG);
const axios = require("axios");
const ethereum = new (require("../etl/utils/ethereum"))(
    process.env.NFT20_INFURA
);

const Discord = require("discord.js");
const webhookClient = new Discord.WebhookClient(
    process.env.DISCORD_GAME,
    process.env.DISCORD_GAME_2
);

// to format in case we need
// const embed = new Discord.MessageEmbed()
//   .setTitle("")
//   .setColor("#0099ff");

// 0xA1C16E4E538A8ff0c8e7b87A7A75f60AA48C12b7

storage = new (require("../etl/utils/storage"))({
    user: process.env.NFT20_DB_USER,
    host: process.env.NFT20_DB_HOST,
    database: "verynifty",
    password: process.env.NFT20_DB_PASSWORD,
    port: 25061,
    ssl: true,
    ssl: { rejectUnauthorized: false }
});
//const vnft = new (require("./utils/vnft"))(ethereum, storage);
GAMEABI = require("../contracts/Game.abi");
game = new ethereum.w3.eth.Contract(
    GAMEABI,
    "0xA1C16E4E538A8ff0c8e7b87A7A75f60AA48C12b7"
);
const sleep = (waitTimeInMs) =>
    new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

(async () => {
    // for testing
    /*webhookClient.send(msg, {
      username: "NFT BATTLES Bot",
      avatarURL:
        "https://pbs.twimg.com/profile_images/1360017205686136833/zdJYITbz_400x400.png",
      // embeds: [embed],
    });
    */
    // for testing
    // bot.telegram.sendMessage(
    //   "-1001164170495", //"438453914", //"-1001164170495"
    //   msg
    // );
    let blockNumber = await storage.getMax("game_attack", "blocknumber  ");
    let maxblock = await ethereum.getLatestBlock();
    // blockNumber = "11381937"
    let bn = 0;
    while (true) {

        let events = await game.getPastEvents("Attak", {
            fromBlock: blockNumber,
            toBlock: maxblock,
        });
        console.log(events)
        for (const event of events) {
            /*  await this.storage.insert("game_attack", {
                  blocknumber: event.blockNumber,
                  transactionhash: this.ethereum.normalizeHash(event.transactionHash),
                  from: this.ethereum.normalizeHash(tx.from),
                  to: this.ethereum.normalizeHash(tx.to),
                  logindex: event.logIndex,
                  timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
                  attacker: this.ethereum.normalizeHash(event.returnValues.who),
                  victim: event.returnValues.opponentId,
                  attack: event.returnValues.attackId
              });
              */
            let nft = await storage.getMulti("game_players_view", { "player_id": event.returnValues.opponentId })
            let weapon = ""
            if (parseInt(event.returnValues.attackId) == 0) {

                weapon = " attacked with a sword ⚔️ "
            } else if (parseInt(event.returnValues.attackId) == 1) {
                weapon = " attacked with a spear 🔱 "

            }
            else if (parseInt(event.returnValues.attackId) == 2) {
                weapon = " BOMBED 💣💣 "

            }
            else if (parseInt(event.returnValues.attackId) == 3) {
                weapon = " RUG PULLLLLED 🧞⭐ "

            }
            let msg = "Oh! " + ethereum.normalizeHash(event.returnValues.who).substring(0, 8) + weapon + " #" + event.returnValues.opponentId + " " + nft.nft_title
            bot.telegram.sendMessage(
                "-1001164170495", //"438453914", //"-1001164170495"
                msg
            );
            /*
            webhookClient.send(msg, {
                username: "NFT BATTLES Bot",
                avatarURL:
                    "https://pbs.twimg.com/profile_images/1360017205686136833/zdJYITbz_400x400.png",
                // embeds: [embed],
            });
            */
        }
        blockNumber = maxblock
        maxblock = await ethereum.getLatestBlock();




        await sleep(10000);
    }


})();