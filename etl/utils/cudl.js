const axios = require("axios");
const BigNumber = require("bignumber.js");

const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

function Cudl(ethereum, storage) {
  this.ethereum = ethereum;
  this.storage = storage;
  this.ERC20ABI = require("../../contracts/ERC20.abi");
  this.PETABI = require("../../contracts/Cudl.abi"); //TODO set ABI
  this.game = new ethereum.w3.eth.Contract(
    this.PETABI,
    "0x9c10AeD865b63f0A789ae64041581EAc63458209"
  );
}

/* 

  event Mined(uint256 nftId, uint256 reward, address recipient);
    event BuyAccessory(
        uint256 nftId,
        uint256 itemId,
        uint256 amount,
        uint256 itemTimeExtension,
        address buyer
    );
    event Fatalize(uint256 opponentId, uint256 nftId, address killer);
    event NewPlayer(
        address nftAddress,
        uint256 nftId,
        uint256 playerId,
        address owner
    );
    event Bonk(
        uint256 attacker,
        uint256 victim,
        uint256 winner,
        uint256 reward
    );
*/

Cudl.prototype.run = async function () {
  let maxBlock = (await this.ethereum.getLatestBlock()) - 2;
  let deployed_block = 12847722;
  let minBlock = Math.max(
    deployed_block,
    await this.storage.getMax("cudl_mined", "blocknumber"),
    await this.storage.getMax("cudl_feed", "blocknumber")
  );
  minBlock -= 2;

  let events = null;

  events = await this.game.getPastEvents("Mined", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
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
    await this.updatePet(event.returnValues.nftId);
  }
  events = await this.game.getPastEvents("BuyAccessory", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
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
    await this.updatePet(event.returnValues.nftId);
  }
  events = await this.game.getPastEvents("Fatalize", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
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
    await this.updatePet(event.returnValues.nftId);
    await this.updatePet(event.returnValues.opponentId);
  }

  events = await this.game.getPastEvents("Bonk", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
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
    await this.updatePet(event.returnValues.attacker);
    await this.updatePet(event.returnValues.victim);
  }

  events = await this.game.getPastEvents("NewPlayer", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
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
    await this.updatePet(event.returnValues.playerId);
  }
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
      tod: new Date(parseInt(infos._timeUntilStarving) * 1000).toUTCString(),
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
