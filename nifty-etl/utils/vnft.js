const axios = require("axios");
const BigNumber = require("bignumber.js");

function VNFT(ethereum, storage) {
  this.ethereum = ethereum;
  this.DEPLOYED_BLOCK = 11023280;
  this.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  this.VNFTAbi = require("../../contracts/VNFT.abi");
  this.RaceAbi = require("../../contracts/Race.abi");
  this.RaceAddress = require("../../contracts/Race.address");
  this.VNFTAddress = require("../../contracts/VNFT.address");
  this.VNFTXAbi = require("../../contracts/VNFTX.abi");
  this.VNFTXAddress = require("../../contracts/VNFTX.address");
  this.LPVNFTAbi = require("../../contracts/LPVNFT.abi");
  this.LPVNFTAddress = require("../../contracts/LPVNFT.address");
  this.MuseAbi = require("../../contracts/Muse.abi");
  this.MuseAddress = require("../../contracts/Muse.address");
  this.contract = new ethereum.w3.eth.Contract(this.VNFTAbi, this.VNFTAddress);
  this.LP = new ethereum.w3.eth.Contract(this.LPVNFTAbi, this.LPVNFTAddress);
  this.vnftx = new ethereum.w3.eth.Contract(this.VNFTXAbi, this.VNFTXAddress);
  this.race = new ethereum.w3.eth.Contract(this.RaceAbi, this.RaceAddress);

  this.museContract = new ethereum.w3.eth.Contract(
    this.MuseAbi,
    this.MuseAddress
  );
  this.storage = storage;
  this.abiDecoder = require("abi-decoder");
  this.abiDecoder.addABI(this.VNFTAbi);
}

VNFT.prototype.getLatestBonks = async function (blocknumber) {
  const bonkEvents = await this.vnftx.getPastEvents("Battle", {
    fromBlock: blocknumber,
    toBlock: "latest",
  });
  return bonkEvents;
};

VNFT.prototype.getGem = function (id) {
  id = parseInt(id);
  let foods = [
    {
      id: 1,
      score: 100,
      days: 3,
      price: 5,
    },
    {
      id: 2,
      score: 190,
      days: 2,
      price: 6,
    },
    {
      id: 3,
      score: 1,
      days: 4,
      price: 3,
    },
    {
      id: 4,
      score: 444,
      days: 1,
      price: 13,
    },
    {
      id: 5,
      score: 1,
      days: 7,
      price: 12,
    },
  ];
  return foods[id];
};

VNFT.prototype.backFill = async function () {
  let vnft = [];
  mint_events = [];
  let maxBlock = await this.ethereum.getLatestBlock();
  let minBlock =
    (await this.storage.getMax("mines", "blocknumber")) || this.DEPLOYED_BLOCK;

  console.log("RUNNING BACKFILL", maxBlock, minBlock);

  const mintEvents = await this.contract.getPastEvents("Transfer", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
  for (const event of mintEvents) {
    let infos = {};
    if (event.returnValues.to != this.ZERO_ADDRESS) {
      infos = await this.contract.methods
        .getVnftInfo(event.returnValues.tokenId)
        .call({}, event.blockNumber);
    }
    let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);
    let tx = await this.ethereum.getTransaction(event.transactionHash);
    // console.log(event.returnValues)
    if (event.returnValues.from == this.ZERO_ADDRESS) {
      // This is a mint event
      let vnft = {
        id: event.returnValues.tokenId,
        score: infos._score,
        level: infos._level,
        expectedreward: infos._expectedReward,
        timeuntilstarving: infos._timeUntilStarving,
        lasttimemined: new Date(
          parseInt(infos._lastTimeMined) * 1000
        ).toUTCString(),
        timeborn: new Date(parseInt(infos._timeVnftBorn * 1000)).toUTCString(),
        starvingtime: new Date(
          parseInt(infos._timeUntilStarving) * 1000
        ).toUTCString(),
        owner: this.ethereum.normalizeHash(infos._owner),
        token: this.ethereum.normalizeHash(infos._token),
        tokenid: infos._tokenId,
        fatalityreward: infos._fatalityReward,
        isdead: false,
        lastblockseen: event.blockNumber,
      };
      if (tx.to.toLowerCase() == "0xe86644c5696d1af082df0b41c5f57e63e27def5d".toLowerCase()) {
        vnft.image_url = "https://gallery.verynifty.io/api/image/race.svg";
        vnft.image_url_dead = "https://gallery.verynifty.io/api/image/race.svg";
      }
      // console.log(vnft)
      await this.storage.insert("vnft", vnft);
      let mint_event = {
        id: event.returnValues.tokenId,
        blocknumber: event.blockNumber,
        transactionhash: this.ethereum.normalizeHash(event.transactionHash),
        from: this.ethereum.normalizeHash(tx.from),
        to: this.ethereum.normalizeHash(tx.to),
        logindex: event.logIndex,
        timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
        minter: this.ethereum.normalizeHash(infos._owner),
      };
      await this.storage.insert("mints", mint_event);
    } else {
      // This is a normal NFT transfer
      await this.updateVNFT(event.returnValues.tokenId, event.blockNumber);
    }

    let transfer_event = {
      id: event.returnValues.tokenId,
      blocknumber: event.blockNumber,
      transactionhash: this.ethereum.normalizeHash(event.transactionHash),
      from: this.ethereum.normalizeHash(tx.from),
      to: this.ethereum.normalizeHash(tx.to),
      logindex: event.logIndex,
      timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
      transferfrom: this.ethereum.normalizeHash(event.returnValues.from),
      transferto: this.ethereum.normalizeHash(event.returnValues.to),
    };
    await this.storage.insert("transfers", transfer_event);
    await this.updateVNFT(event.returnValues.tokenId, event.blockNumber);
  }

  const caretakerAdd = await this.contract.getPastEvents("CareTakerAdded", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
  for (const add of caretakerAdd) {
    let tx = await this.ethereum.getTransaction(add.transactionHash);
    let timestamp = await this.ethereum.getBlockTimestamp(add.blockNumber);
    let event = {
      id: add.returnValues.nftId,
      blocknumber: add.blockNumber,
      transactionhash: this.ethereum.normalizeHash(add.transactionHash),
      from: this.ethereum.normalizeHash(tx.from),
      owner: this.ethereum.normalizeHash(tx.from),
      to: this.ethereum.normalizeHash(tx.to),
      logindex: add.logIndex,
      timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
      caretaker: this.ethereum.normalizeHash(add.returnValues._to),
    };
    //  console.log(feed_event)
    await this.storage.insert("caretaker_add", event);
    await this.updateVNFT(add.returnValues.nftId, event.blockNumber);
  }

  const caretakerRemove = await this.contract.getPastEvents(
    "CareTakerRemoved",
    {
      fromBlock: minBlock,
      toBlock: maxBlock,
    }
  );
  for (const add of caretakerRemove) {
    let tx = await this.ethereum.getTransaction(add.transactionHash);
    let timestamp = await this.ethereum.getBlockTimestamp(add.blockNumber);
    let event = {
      id: add.returnValues.nftId,
      blocknumber: add.blockNumber,
      transactionhash: this.ethereum.normalizeHash(add.transactionHash),
      from: this.ethereum.normalizeHash(tx.from),
      owner: this.ethereum.normalizeHash(tx.from),
      to: this.ethereum.normalizeHash(tx.to),
      logindex: add.logIndex,
      timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
      caretaker: this.ethereum.normalizeHash(add.returnValues._to),
    };
    //  console.log(feed_event)
    await this.storage.insert("caretaker_remove", event);
  }

  const buyAdd = await this.vnftx.getPastEvents("BuyAddon", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
  for (const add of buyAdd) {
    let tx = await this.ethereum.getTransaction(add.transactionHash);
    let timestamp = await this.ethereum.getBlockTimestamp(add.blockNumber);
    let event = {
      nftid: add.returnValues.nftId,
      blocknumber: add.blockNumber,
      transactionhash: this.ethereum.normalizeHash(add.transactionHash),
      from: this.ethereum.normalizeHash(tx.from),
      owner: this.ethereum.normalizeHash(tx.from),
      to: this.ethereum.normalizeHash(tx.to),
      logindex: add.logIndex,
      timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
      addonid: add.returnValues.addon,
    };
    //  console.log(feed_event)
    await this.storage.insert("addon_add", event);
    await this.updateVNFT(add.returnValues.nftId, tx.blockNumber);
  }

  const addonAdd = await this.vnftx.getPastEvents("AttachAddon", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
  for (const add of addonAdd) {
    let tx = await this.ethereum.getTransaction(add.transactionHash);
    let timestamp = await this.ethereum.getBlockTimestamp(add.blockNumber);
    let event = {
      nftid: add.returnValues.nftId,
      blocknumber: add.blockNumber,
      transactionhash: this.ethereum.normalizeHash(add.transactionHash),
      from: this.ethereum.normalizeHash(tx.from),
      owner: this.ethereum.normalizeHash(tx.from),
      to: this.ethereum.normalizeHash(tx.to),
      logindex: add.logIndex,
      timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
      addonid: add.returnValues.addonId,
    };
    //  console.log(feed_event)
    await this.storage.insert("addon_add", event);
    await this.updateVNFT(add.returnValues.nftId, tx.blockNumber);
  }

  const removeAdd = await this.vnftx.getPastEvents("RemoveAddon", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
  for (const add of removeAdd) {
    let tx = await this.ethereum.getTransaction(add.transactionHash);
    let timestamp = await this.ethereum.getBlockTimestamp(add.blockNumber);
    let event = {
      nftid: add.returnValues.nftId,
      blocknumber: add.blockNumber,
      transactionhash: this.ethereum.normalizeHash(add.transactionHash),
      from: this.ethereum.normalizeHash(tx.from),
      owner: this.ethereum.normalizeHash(tx.from),
      to: this.ethereum.normalizeHash(tx.to),
      logindex: add.logIndex,
      timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
      addonid: add.returnValues.addonId,
    };
    //  console.log(feed_event)
    await this.storage.insert("addon_remove", event);
    await this.updateVNFT(add.returnValues.nftId, tx.blockNumber);
  }

  const museTransfers = await this.museContract.getPastEvents("Transfer", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
  for (const t of museTransfers) {
    let tx = await this.ethereum.getTransaction(t.transactionHash);
    let timestamp = await this.ethereum.getBlockTimestamp(t.blockNumber);
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
    await this.storage.insert("muse_transfers", event);
  }

  // We check for vNFT eating gems
  const feedEvents = await this.contract.getPastEvents("VnftConsumed", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
  for (const event of feedEvents) {
    let tx = await this.ethereum.getTransaction(event.transactionHash);
    let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);
    let infos = await this.contract.methods
      .getVnftInfo(event.returnValues.nftId)
      .call({}, event.blockNumber);
    let food = this.getGem(event.returnValues.itemId);
    let feed_event = {
      id: event.returnValues.nftId,
      blocknumber: event.blockNumber,
      transactionhash: this.ethereum.normalizeHash(event.transactionHash),
      from: this.ethereum.normalizeHash(tx.from),
      to: this.ethereum.normalizeHash(tx.to),
      logindex: event.logIndex,
      timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
      feeder: this.ethereum.normalizeHash(event.returnValues.giver),
      gemid: this.ethereum.normalizeHash(event.returnValues.itemId),
    };
    //  console.log(feed_event)
    await this.storage.insert("feeds", feed_event);
    await this.updateVNFT(event.returnValues.nftId, event.blockNumber);
  }

  lpMineEvents = await this.LP.getPastEvents("Redeem", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
  for (const event of lpMineEvents) {
    const id = parseInt(event.returnValues.newvnftid);
    const seed = "SEED" + id + "Koala";

    let vnft = await this.storage.get("vnft", "id", id);
    if (vnft != null) {
      const color1 = randomColor({ seed: seed });
      console.log(color1);
      const color2 = randomColor({
        seed: seed,
        hue: color1,
        luminosity: "light",
        count: 1,
      });
      let url = `https://gallery.verynifty.io/api/image/lp2.svg?color1=${color1.replace(
        "#",
        "%23"
      )}&color2=${color2[0].replace("#", "%23")}`;
      await this.storage.update("vnft", "id", id, {
        image_url: url,
        image_url_dead: "https://gallery.verynifty.io/api/img/nft/lp2-rekt.svg",
      });
    }
  }

  // */

  // We check for vNFT getting Fatalized (you're dead)
  const killEvents = await this.contract.getPastEvents("VnftFatalized", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
  for (const event of killEvents) {
    let tx = await this.ethereum.getTransaction(event.transactionHash);
    let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);

    let kill_call = this.abiDecoder.decodeMethod(tx.input);
    if (kill_call != null && kill_call.name == "fatality") {
      let killerId = kill_call.params[1].value;
      await this.updateVNFT(killerId, event.blockNumber);
    }
    let kill_event = {
      id: event.returnValues.nftId,
      blocknumber: event.blockNumber,
      transactionhash: this.ethereum.normalizeHash(event.transactionHash),
      from: this.ethereum.normalizeHash(tx.from),
      to: this.ethereum.normalizeHash(tx.to),
      logindex: event.logIndex,
      timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
      killer: event.returnValues.killer,
    };
    //  console.log(kill_event)
    await this.storage.insert("kills", kill_event);
  }

  // We check for vNFT getting Mined (claiming rewards)
  const minedEvents = await this.contract.getPastEvents(
    "ClaimedMiningRewards",
    {
      fromBlock: minBlock,
      toBlock: maxBlock,
    }
  );
  for (const event of minedEvents) {
    let tx = await this.ethereum.getTransaction(event.transactionHash);
    let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);
    let mine_event = {
      id: event.returnValues.who,
      blocknumber: event.blockNumber,
      transactionhash: this.ethereum.normalizeHash(event.transactionHash),
      from: this.ethereum.normalizeHash(tx.from),
      to: this.ethereum.normalizeHash(tx.to),
      logindex: event.logIndex,
      timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
      miner: event.returnValues.owner,
      amount: event.returnValues.amount,
    };
    //  console.log(mine_event)
    await this.storage.insert("mines", mine_event);
  }
};

VNFT.prototype.updateVNFT = async function (id, blocknumber) {
  blocknumber = parseInt(blocknumber);
  let vnft = await this.storage.get("vnft", "id", id);
  let isDead = false;
  let vnft_data = {};
  if (vnft == null) {
    let infos = await this.contract.methods
      .getVnftInfo(id)
      .call({}, blocknumber);
    let infosx = await this.vnftx.methods.getVnftInfo(id).call({}, blocknumber);
    let addons = [];
    for (const addon of infosx._addons) {
      if (parseInt(addon) != 0) {
        addons.push(parseInt(addon));
      }
    }
    let vnft = {
      id: id,
      score: infos._score,
      level: infos._level,
      expectedreward: infos._expectedReward,
      timeuntilstarving: infos._timeUntilStarving,
      lasttimemined: new Date(
        parseInt(infos._lastTimeMined) * 1000
      ).toUTCString(),
      timeborn: new Date(parseInt(infos._timeVnftBorn * 1000)).toUTCString(),
      starvingtime: new Date(
        parseInt(infos._timeUntilStarving) * 1000
      ).toUTCString(),
      owner: this.ethereum.normalizeHash(infos._owner),
      token: this.ethereum.normalizeHash(infos._token),
      tokenid: infos._tokenId,
      fatalityreward: infos._fatalityReward,
      isdead: false,
      lastblockseen: blocknumber,
      addons: JSON.stringify(addons),
      rarity: infosx._rarity,
      hp_lastseen: infosx._hp,
      addons_count: infosx._addonsCount,
    };
    // console.log(vnft)
    await this.storage.insert("vnft", vnft);
    return;
  }
  if (parseInt(vnft.lastseenblock) > blocknumber || vnft.isDead) {
    return;
  } else {
    let infos = null;
    try {
      let infos = await this.contract.methods
        .getVnftInfo(id)
        .call({}, "latest");
      let infosx = await this.vnftx.methods
        .getVnftInfo(id)
        .call({}, blocknumber);
      console.log(this.vnftx.methods.getVnftInfo(id).encodeABI());
      let addons = [];
      for (const addon of infosx._addons) {
        if (parseInt(addon) != 0) {
          addons.push(parseInt(addon));
        }
      }
      vnft_data = {
        score: infos._score,
        level: infos._level,
        expectedreward: infos._expectedReward,
        timeuntilstarving: infos._timeUntilStarving,
        lasttimemined: new Date(
          parseInt(infos._lastTimeMined) * 1000
        ).toUTCString(),
        starvingtime: new Date(
          parseInt(infos._timeUntilStarving) * 1000
        ).toUTCString(),
        owner: this.ethereum.normalizeHash(infos._owner),
        lastblockseen: blocknumber,
        fatalityreward: infos._fatalityReward,
        addons: JSON.stringify(addons),
        rarity: infosx._rarity,
        hp_lastseen: infosx._hp,
        addons_count: infosx._addonsCount,
      };
    } catch (error) {
      // The NFT is dead
      console.log(error);
      isDead = true;
    }
  }
  vnft_data.isdead = isDead;
  vnft_data.lastblockseen = await this.ethereum.getLatestBlock();
  await this.storage.update("vnft", "id", id, vnft_data);
  try {
    let res = await axios.get(
      "https://api.opensea.io/asset/0x57f0b53926dd62f2e26bc40b30140abea474da94/" +
        id +
        "/?force_update=true"
    );
  } catch (error) {
    console.log("opensea error", error);
  }
};

VNFT.prototype.getVNFT = async function (id, blocknumber) {
  blocknumber = parseInt(blocknumber);
  let infos = await this.contract.methods
        .getVnftInfo(id)
        .call({}, "latest");
  let infosx = await this.vnftx.methods.getVnftInfo(id).call({}, blocknumber);
  infos.hp = parseInt(infosx._hp)
  return infos
};

VNFT.prototype.testCaretaker = async function () {
  let maxBlock = await this.ethereum.getLatestBlock();
  let minBlock = this.DEPLOYED_BLOCK;

  for (let index = 0; minBlock < maxBlock; minBlock += 1000) {
    const mintEvents = await this.contract.getPastEvents("Transfer", {
      fromBlock: minBlock,
      toBlock: maxBlock,
    });

    console.log(mintEvents);
    for (const event of mintEvents) {
      let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);
      let tx = await this.ethereum.getTransaction(event.transactionHash);

      let transfer_event = {
        id: event.returnValues.tokenId,
        blocknumber: event.blockNumber,
        transactionhash: this.ethereum.normalizeHash(event.transactionHash),
        from: this.ethereum.normalizeHash(tx.from),
        to: this.ethereum.normalizeHash(tx.to),
        logindex: event.logIndex,
        timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
        transferfrom: this.ethereum.normalizeHash(event.returnValues.from),
        transferto: this.ethereum.normalizeHash(event.returnValues.to),
      };
      await this.storage.insert("transfers", transfer_event);
    }
  }
};

VNFT.prototype.verifyLPMints = async function () {
  lpMineEvents = await this.LP.getPastEvents("Redeem", {
    fromBlock: 0,
    toBlock: "latest",
  });
  for (const event of lpMineEvents) {
    const id = parseInt(event.returnValues.newvnftid);
    const seed = (id * 10000) % 555;
    let vnft = await this.storage.get("vnft", "id", id);
    if (vnft != null) {
      const color1 = randomColor({ seed: seed });
      const color2 = randomColor({
        seed: seed,
        hue: color1,
        luminosity: "light",
        count: 1,
      });
      let url = `https://gallery.verynifty.io/api/image/lp1.svg?color1=${color1.replace(
        "#",
        "%23"
      )}&color2=${color2[0].replace("#", "%23")}`;
      await this.storage.update("vnft", "id", id, {
        image_url: url,
        image_url_dead: "https://gallery.verynifty.io/api/img/nft/lp1-rekt.svg",
      });
    }
  }
};

VNFT.prototype.manualgetKills = async function () {
  const killEvents = await this.contract.getPastEvents("VnftFatalized", {
    fromBlock: "11234871",
    toBlock: "latest",
  });
  for (const event of killEvents) {
    let tx = await this.ethereum.getTransaction(event.transactionHash);
    let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);

    let kill_call = this.abiDecoder.decodeMethod(tx.input);
    if (kill_call != null && kill_call.name == "fatality") {
      let killerId = kill_call.params[1].value;
      await this.updateVNFT(killerId, event.blockNumber);
    }
    let kill_event = {
      id: event.returnValues.nftId,
      blocknumber: event.blockNumber,
      transactionhash: this.ethereum.normalizeHash(event.transactionHash),
      from: this.ethereum.normalizeHash(tx.from),
      to: this.ethereum.normalizeHash(tx.to),
      logindex: event.logIndex,
      timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
      killer: event.returnValues.killer,
    };
    //  console.log(kill_event)
    await this.storage.insert("kills", kill_event);
  }
};

VNFT.prototype.verifyAddons = async function () {
  //     event BuyAddon(uint256 nftId, uint256 addon, address player);

  minBlock = 0;
  maxBlock = "latest";

  const buyAdd = await this.vnftx.getPastEvents("BuyAddon", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
  for (const add of buyAdd) {
    let tx = await this.ethereum.getTransaction(add.transactionHash);
    let timestamp = await this.ethereum.getBlockTimestamp(add.blockNumber);
    let event = {
      nftid: add.returnValues.nftId,
      blocknumber: add.blockNumber,
      transactionhash: this.ethereum.normalizeHash(add.transactionHash),
      from: this.ethereum.normalizeHash(tx.from),
      owner: this.ethereum.normalizeHash(tx.from),
      to: this.ethereum.normalizeHash(tx.to),
      logindex: add.logIndex,
      timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
      addonid: add.returnValues.addon,
    };
    //  console.log(feed_event)
    await this.storage.insert("addon_add", event);
    await this.updateVNFT(add.returnValues.nftId, tx.blockNumber);
  }

  const addonAdd = await this.vnftx.getPastEvents("AttachAddon", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
  console.log(addonAdd);
  for (const add of addonAdd) {
    let tx = await this.ethereum.getTransaction(add.transactionHash);
    let timestamp = await this.ethereum.getBlockTimestamp(add.blockNumber);
    let event = {
      nftid: add.returnValues.nftId,
      blocknumber: add.blockNumber,
      transactionhash: this.ethereum.normalizeHash(add.transactionHash),
      from: this.ethereum.normalizeHash(tx.from),
      owner: this.ethereum.normalizeHash(tx.from),
      to: this.ethereum.normalizeHash(tx.to),
      logindex: add.logIndex,
      timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
      addonid: add.returnValues.addonId,
    };
    //  console.log(feed_event)
    await this.storage.insert("addon_add", event);
  }

  const removeAdd = await this.vnftx.getPastEvents("RemoveAddon", {
    fromBlock: minBlock,
    toBlock: maxBlock,
  });
  console.log(removeAdd);

  for (const add of removeAdd) {
    let tx = await this.ethereum.getTransaction(add.transactionHash);
    let timestamp = await this.ethereum.getBlockTimestamp(add.blockNumber);
    let event = {
      nftid: add.returnValues.nftId,
      blocknumber: add.blockNumber,
      transactionhash: this.ethereum.normalizeHash(add.transactionHash),
      from: this.ethereum.normalizeHash(tx.from),
      owner: this.ethereum.normalizeHash(tx.from),
      to: this.ethereum.normalizeHash(tx.to),
      logindex: add.logIndex,
      timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
      addonid: add.returnValues.addonId,
    };
    //  console.log(feed_event)
    await this.storage.insert("addon_remove", event);
  }
};

VNFT.prototype.verifyLP = async function () {
  const lpEvents = await this.LP.getPastEvents("Deposit", {
    fromBlock: 0,
    toBlock: "latest",
  });

  let accounts = {};

  let total = 0;
  let minBlock = 999999999999;
  let maxBlock = 0;
  let blocks = 0;
  let sum = 0;

  for (const event of lpEvents) {
    if (accounts[event.returnValues.user] == null) {
      accounts[event.returnValues.user] = {
        deposits: 0,
        amount: 0,
        pending: 0,
      };
    }
    minBlock = Math.min(minBlock, event.blockNumber);
    maxBlock = Math.max(maxBlock, event.blockNumber);

    let pending = await this.LP.methods
      .pendingPoints(0, event.returnValues.user)
      .call({});
    accounts[event.returnValues.user].pending = new BigNumber(pending)
      .shiftedBy(-18)
      .toNumber();
    accounts[event.returnValues.user].deposits++;
    accounts[event.returnValues.user].amount += new BigNumber(
      event.returnValues.amount
    )
      .shiftedBy(-18)
      .toNumber();
    total += new BigNumber(event.returnValues.amount).shiftedBy(-18).toNumber();
  }
  blocks = maxBlock - minBlock;
  for (const acc in accounts) {
    sum += accounts[acc].pending;
    if (accounts[acc].deposits > 0) {
      console.log(accounts[acc]);
    }
  }
  // console.log(accounts)

  console.log("Total::", total);
  console.log("Blocks", blocks);
  console.log("Estimated reward", blocks * 0.33058571);
  console.log("Given reward", sum);
  console.log("Error ration", (sum / blocks) * 0.33058571);
};

module.exports = VNFT;
