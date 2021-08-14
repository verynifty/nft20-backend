const axios = require("axios");
const BigNumber = require("bignumber.js");
const e = require("express");

const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

function Cudl(ethereum, storage) {
  this.ethereum = ethereum;
  this.storage = storage;
  this.ERC20ABI = require("../../contracts/ERC20.abi");
  this.PETABI = require("../../contracts/Cudl.abi"); 
  this.BAZAARABI = require("../../contracts/Cudl.abi") //TODO set ABI
  this.game = new ethereum.w3.eth.Contract(
    this.PETABI,
    "0x9c10AeD865b63f0A789ae64041581EAc63458209"
  );
  this.bazaar = new ethereum.w3.eth.Contract(
    this.BAZAARABI,
    "0x9c10AeD865b63f0A789ae64041581EAc63458209" //TODO set Address
  );
  this.runs = 0;
}

Cudl.prototype.run = async function () {
  let petToUpdate = {}
  let maxBlock = (await this.ethereum.getLatestBlock()) - 2;
  let deployed_block = 12847722;
  let minBlock = Math.max(
    deployed_block,
    await this.storage.getMax("cudl_mined", "blocknumber"),
    await this.storage.getMax("cudl_feed", "blocknumber")
  );
  console.log("Start ingesting on ", minBlock, maxBlock, maxBlock - minBlock);

  /*
  //This will be for later
  if (maxBlock - minBlock > 20000) {
    console.log("Limiting ingestion to 3 days");
    maxBlock = minBlock + 20000 
  }
  */

  minBlock -= 2;

  let events = [];

  events = await this.game.getPastEvents("Mined", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
  console.log("Making Mined events :", events.length)
  for (const event of events) {
    let tx = await this.ethereum.getTransaction(event.transactionHash);
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
  console.log("Making BuyAccessory events :", events.length)

  for (const event of events) {
    let tx = await this.ethereum.getTransaction(event.transactionHash);
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
  console.log("Making Fatalize events :", events.length)

  for (const event of events) {
    let tx = await this.ethereum.getTransaction(event.transactionHash);
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
  console.log("Making Bonk events :", events.length)

  for (const event of events) {
    let tx = await this.ethereum.getTransaction(event.transactionHash);
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
  console.log("Making NewPlayer events :", events.length)

  for (const event of events) {
    let tx = await this.ethereum.getTransaction(event.transactionHash);
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
  petToUpdate = Object.keys(petToUpdate)
  console.log("updating pets :", petToUpdate.length)
  if (this.runs % 10 == 0) {
    let maxId = await this.storage.getMax("cudl_pet", "pet_id")
    let i = 0;
    while (i < maxId) {
      await this.updatePet(i++)
    }
  } else {
    for (const pet of petToUpdate) {
      await this.updatePet(pet);
    }
  }

  try {
    events = await this.bazaar.getPastEvents("Hibernation", {
      fromBlock: minBlock,
      toBlock: maxBlock,
    });
    console.log("Making Hibernation events :", events.length)
  
    for (const event of events) {
      let tx = await this.ethereum.getTransaction(event.transactionHash);
      let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);
      await this.storage.insert("cudl_hibernation", {
        blocknumber: event.blockNumber,
        transactionhash: this.ethereum.normalizeHash(event.transactionHash),
        from: this.ethereum.normalizeHash(tx.from),
        to: this.ethereum.normalizeHash(tx.to),
        logindex: event.logIndex,
        timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
        gasprice: tx.gasPrice,
        pet_id: event.returnValues.nftId
      });
      petToUpdate[event.returnValues.nftId] = true;
    }

  } catch (error) {
    console.log("Hibernation", error)
  }

  try {
    events = await this.bazaar.getPastEvents("ChangeName", {
      fromBlock: minBlock,
      toBlock: maxBlock,
    });
    console.log("Making ChangeName events :", events.length)
  
    for (const event of events) {
      let tx = await this.ethereum.getTransaction(event.transactionHash);
      let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);
      await this.storage.insert("cudl_changename", {
        blocknumber: event.blockNumber,
        transactionhash: this.ethereum.normalizeHash(event.transactionHash),
        from: this.ethereum.normalizeHash(tx.from),
        to: this.ethereum.normalizeHash(tx.to),
        logindex: event.logIndex,
        timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
        gasprice: tx.gasPrice,
        pet_id: event.returnValues.nftId
      });
      petToUpdate[event.returnValues.nftId] = true;
    }

  } catch (error) {
    console.log("ChangeName", error)
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
    let name =  null /* await this.bazaar.methods
      .petName(playerId)
      .call();
      */
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
      last_time_mined: new Date(parseInt(infos._lastTimeMined) * 1000).toUTCString(),
      tod: new Date(parseInt(infos._timeUntilStarving) * 1000).toUTCString(),
      name: name
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

module.exports = Cudl;
