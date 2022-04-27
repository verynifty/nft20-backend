const axios = require("axios");
const BigNumber = require("bignumber.js");
const e = require("express");

const SLEEP_TIME_INTERVAL = 500;

const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

function Cudl(ethereum, storage) {
  this.ethereum = ethereum;
  this.storage = storage;
  this.ERC20ABI = require("../../contracts/ERC20.abi");
  this.PETABI = require("../../contracts/Cudl.abi");
  this.BAZAARABI = require("../../contracts/CudlBazaar.abi") //TODO set ABI
  this.game = new ethereum.w3.eth.Contract(
    this.PETABI,
    "0x58b1422b21d58Ae6073ba7B28feE62F704Fc2539"
  );
   this.bazaar = new ethereum.w3.eth.Contract(
     this.BAZAARABI,
     "0xf8f861E3F09b5E3C8f2648D45C4265fAeA922a88" //TODO set Address
   );
  this.runs = 0;
}

Cudl.prototype.run = async function () {
  let petToUpdate = {};
  let maxBlock = (await this.ethereum.getLatestBlock());
  let deployed_block = 1946298;
  let minBlock = Math.max(
    deployed_block,
    await this.storage.getMax("cudl_mined", "blocknumber"),
    await this.storage.getMax("cudl_feed", "blocknumber")
  );
  console.log("Start ingesting on ", minBlock, maxBlock, maxBlock - minBlock);

  /*
  // Fix ingestion when missing activity
  if (maxBlock - minBlock > 100000) {
    console.log("Limiting ingestion to delta blocks");
    maxBlock = minBlock + 100000
  }
  */
  minBlock -= 100;
  

  let events = [];

  events = await this.game.getPastEvents("Mined", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
  console.log("Making Mined events :", events.length);
  for (const event of events) {
    let tx = await this.ethereum.getTransaction(event.transactionHash);
    await sleep(SLEEP_TIME_INTERVAL);
    let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);
    await this.storage.insert("cudl_mined", {
      blocknumber: event.blockNumber,
      transactionhash: this.ethereum.normalizeHash(event.transactionHash),
      from: this.ethereum.normalizeHash(tx.from),
      to: this.ethereum.normalizeHash(tx.to),
      logindex: event.logIndex,
      timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
      gasprice: tx.gasPrice,
      pet: event.returnValues.nftId,
      amount: event.returnValues.reward,
      recipient: this.ethereum.normalizeHash(event.returnValues.recipient),
    });
    petToUpdate[event.returnValues.nftId] = true;
  }

  events = await this.game.getPastEvents("BuyAccessory", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
  console.log("Making BuyAccessory events :", events.length);

  for (const event of events) {
    let tx = await this.ethereum.getTransaction(event.transactionHash);
    await sleep(SLEEP_TIME_INTERVAL);

    let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);
    await this.storage.insert("cudl_feed", {
      blocknumber: event.blockNumber,
      transactionhash: this.ethereum.normalizeHash(event.transactionHash),
      from: this.ethereum.normalizeHash(tx.from),
      to: this.ethereum.normalizeHash(tx.to),
      logindex: event.logIndex,
      timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
      gasprice: tx.gasPrice,
      pet: event.returnValues.nftId,
      item: event.returnValues.itemId,
      amount_paid: event.returnValues.amount,
      time_extension: event.returnValues.itemTimeExtension,
      buyer: this.ethereum.normalizeHash(event.returnValues.buyer),
    });
    petToUpdate[event.returnValues.nftId] = true;
  }

  events = await this.game.getPastEvents("Fatalize", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
  console.log("Making Fatalize events :", events.length);

  for (const event of events) {
    let tx = await this.ethereum.getTransaction(event.transactionHash);
    await sleep(SLEEP_TIME_INTERVAL);

    let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);
    await this.storage.insert("cudl_fatalize", {
      blocknumber: event.blockNumber,
      transactionhash: this.ethereum.normalizeHash(event.transactionHash),
      from: this.ethereum.normalizeHash(tx.from),
      to: this.ethereum.normalizeHash(tx.to),
      logindex: event.logIndex,
      timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
      gasprice: tx.gasPrice,
      victim: event.returnValues.opponentId,
      winner: event.returnValues.nftId,
      badguy: this.ethereum.normalizeHash(event.returnValues.killer),
    });
    petToUpdate[event.returnValues.nftId] = true;
    petToUpdate[event.returnValues.opponentId] = true;
  }

  events = await this.game.getPastEvents("Bonk", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
  console.log("Making Bonk events :", events.length);

  for (const event of events) {
    let tx = await this.ethereum.getTransaction(event.transactionHash);
    await sleep(SLEEP_TIME_INTERVAL);

    let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);
    await this.storage.insert("cudl_bonk", {
      blocknumber: event.blockNumber,
      transactionhash: this.ethereum.normalizeHash(event.transactionHash),
      from: this.ethereum.normalizeHash(tx.from),
      to: this.ethereum.normalizeHash(tx.to),
      logindex: event.logIndex,
      timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
      gasprice: tx.gasPrice,
      attacker: event.returnValues.attacker,
      victim: event.returnValues.victim,
      winner: event.returnValues.winner,
      reward: event.returnValues.reward,
    });
    petToUpdate[event.returnValues.attacker] = true;
    petToUpdate[event.returnValues.victim] = true;
  }

  events = await this.game.getPastEvents("NewPlayer", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
  console.log("Making NewPlayer events :", events.length);

  for (const event of events) {
    let tx = await this.ethereum.getTransaction(event.transactionHash);
    await sleep(SLEEP_TIME_INTERVAL);

    let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);
    await this.storage.insert("cudl_register", {
      blocknumber: event.blockNumber,
      transactionhash: this.ethereum.normalizeHash(event.transactionHash),
      from: this.ethereum.normalizeHash(tx.from),
      to: this.ethereum.normalizeHash(tx.to),
      logindex: event.logIndex,
      timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
      gasprice: tx.gasPrice,
      originnft: this.ethereum.normalizeHash(event.returnValues.nftAddress),
      originid: this.ethereum.normalizeHash(event.returnValues.nftId),
      pet_id: event.returnValues.playerId,
      owner: this.ethereum.normalizeHash(event.returnValues.owner),
    });
    petToUpdate[event.returnValues.playerId] = true;
  }
  petToUpdate = Object.keys(petToUpdate);
  console.log("updating pets :", petToUpdate.length);
  if ((this.runs + 1) % 101 == 0) {
    let maxId = await this.storage.getMax("cudl_pet", "pet_id");
    let i = 0;
    while (i < maxId) {
      await sleep(500);
      await this.updatePet(i++);
    }
  } else {
    for (const pet of petToUpdate) {
      await this.updatePet(pet);
    }
  }
  
    try {
      events = await this.bazaar.getPastEvents("BazaarItem", {
        fromBlock: minBlock,
        toBlock: maxBlock,
      });
      console.log("Making Bazaar events :", events.length)
    
      for (const event of events) {
        let tx = await this.ethereum.getTransaction(event.transactionHash);
        await sleep(SLEEP_TIME_INTERVAL);

        let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);
        await this.storage.insert("cudl_bazaar", {
          blocknumber: event.blockNumber,
          transactionhash: this.ethereum.normalizeHash(event.transactionHash),
          from: this.ethereum.normalizeHash(tx.from),
          to: this.ethereum.normalizeHash(tx.to),
          logindex: event.logIndex,
          timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
          gasprice: tx.gasPrice,
          pet_id: event.returnValues.nftId,
          item: event.returnValues.item
        });
        petToUpdate[event.returnValues.nftId] = true;
      }
  
    } catch (error) {
      console.log("Hibernation", error)
    }
  
    
  this.runs++;
};

Cudl.prototype.updatePet = async function (playerId) {
  if (playerId == null) {
    return;
  }
  try {
    let infos = await this.game.methods.getPetInfo(playerId).call();
    let careTaker = await this.game.methods
      .getCareTaker(playerId, infos._owner)
      .call();
      await sleep(SLEEP_TIME_INTERVAL);

    let name =  await this.bazaar.methods
      .name(playerId)
      .call();
    
    let player = {
      pet_id: infos._pet,
      is_alive: infos._isAlive,
      is_starving: infos._isStarving,
      score: infos._score,
      expected_reward: infos._expectedReward,
      time_born: new Date(parseInt(infos._timepetBorn) * 1000).toUTCString(),
      owner: this.ethereum.normalizeHash(infos._owner),
      nft_contract: this.ethereum.normalizeHash(infos._token),
      nft_id: infos._tokenId,
      caretaker: this.ethereum.normalizeHash(careTaker),
      last_time_mined: new Date(
        parseInt(infos._lastTimeMined) * 1000
      ).toUTCString(),
      tod: new Date(parseInt(infos._timeUntilStarving) * 1000).toUTCString(),
      name: name,
    };
    await this.storage
      .knex("cudl_pet")
      .insert(player)
      .onConflict("pet_id")
      .merge();
  } catch (error) {
    console.log(error);
    console.log("The pet must be dead");
    let player = {
      pet_id: playerId,
      is_alive: false,
    };
    await this.storage.update("cudl_pet", "pet_id", playerId, {
      is_alive: false,
    });
  }
};

/*
Cudl.prototype.fixTransfers = async function () {
  let chunkJump = 1000;
  let latest = 1946298
  while (true) {
    console.log("FROM ", latest, latest + chunkJump)
    const txs = await this.game.getPastEvents("Transfer", {
      fromBlock: latest - 10,
      toBlock: latest + chunkJump,
    });
    console.log("FOUND ", txs.length)
    for (const t of txs) {
      let tx = await this.ethereum.getTransaction(t.transactionHash);
      let timestamp = await this.ethereum.getBlockTimestamp(t.blockNumber);
      console.log(t.blockNumber)
      let event = {
        amount: t.returnValues.value,
        blocknumber: t.blockNumber,
        transactionhash: this.ethereum.normalizeHash(t.transactionHash),
        from: this.ethereum.normalizeHash(tx.from),
        to: this.ethereum.normalizeHash(tx.to),
        logindex: t.logIndex,
        timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
        sender: this.ethereum.normalizeHash(t.returnValues.from),
        receiver: this.ethereum.normalizeHash(t.returnValues.to),
      };
      //  console.log(feed_event)
      await this.storage.insert("cudl_transfers", event);
    }
    latest += chunkJump
  }
*/

module.exports = Cudl;
