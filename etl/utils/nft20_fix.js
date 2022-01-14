const axios = require("axios");
const BigNumber = require("bignumber.js");

const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

// lastblock muse = 12291439

function NFT20(ethereum, storage) {
  this.ethereum = ethereum;
  this.DEPLOYED_BLOCK = 11023280;
  this.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  this.ERC20ABI = require("../../contracts/ERC20.abi");
  this.ERC1155ABI = require("../../contracts/ERC1155.abi");
  this.ERC721ABI = require("../../contracts/ERC721.abi");
  this.ERC721ABICRYSTAL = require("../../contracts/ERC721CRYSTAL.abi"); // Thia ABI is used in the specific case of Crypto Crystalb
  this.UNIROUTERABI = require("../../contracts/UniRouter.abi");
  this.UNIROUTERV3ABI = require("../../contracts/UniRouterV3.abi");
  this.UNIQUOTERV3ABI = require("../../contracts/UniQuoterV3.abi");

  this.AUCTIONABI = require("../../contracts/Auction.abi");
  this.PAIRABI = require("../../contracts/Pair.abi");
  this.FACTORYABI = require("../../contracts/Factory.abi");
  this.counter = 0;

  this.museContract = new ethereum.w3.eth.Contract(
    this.ERC20ABI,
    "0xb6ca7399b4f9ca56fc27cbff44f4d2e4eef1fc81"
  );

  this.NETWORK =
    process.env.NETWORK == null ? 0 : parseInt(process.env.NETWORK);
  if (this.NETWORK == 0) {
    this.factory = new ethereum.w3.eth.Contract(
      this.FACTORYABI,
      "0x0f4676178b5c53ae0a655f1b19a96387e4b8b5f2"
    );

    this.auction = new ethereum.w3.eth.Contract(
      this.AUCTIONABI,
      "0x18304eF06f474A027b28Eb0099F675Fc258776dF"
    );

    this.uniRouter = new ethereum.w3.eth.Contract(
      this.UNIROUTERABI,
      "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
    );
    this.uniRouterV3 = new ethereum.w3.eth.Contract(
      this.UNIROUTERV3ABI,
      "0xE592427A0AEce92De3Edee1F18E0157C05861564"
    )

    this.uniQuoterV3 = new ethereum.w3.eth.Contract(
      this.UNIQUOTERV3ABI,
      "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
    )
  } else {
    // This is Matic
    this.factory = new ethereum.w3.eth.Contract(
      this.FACTORYABI,
      "0x32Aaba6E37dc4C800C4f439DBD1A71415C765054"
    );

    this.auction = new ethereum.w3.eth.Contract(
      this.AUCTIONABI,
      "0x18304eF06f474A027b28Eb0099F675Fc258776dF"
    );
  }

  this.storage = storage;
  this.abiDecoder = require("abi-decoder");
  this.abiDecoder.addABI(this.FACTORYABI);
  console.log(this.NETWORK);
}

NFT20.prototype.getPairs = async function (withUpdate = false) {
  console.log("EXEC")
  let original = "0x7EA3Cca10668B8346aeC0bf1844A49e995527c8B"
  let pairDetail = await this.factory.methods
    .nftToToken(original)
    .call();
  let o = {
    address: this.ethereum.normalizeHash("0x5e3b208e01c7da4fdf4edea1591afbd83401304b"),
    nft: this.ethereum.normalizeHash("0x7ea3cca10668b8346aec0bf1844a49e995527c8b"),
    nft_type: 721
  }
  console.log("AFTER", o)

  return [o];
};

NFT20.prototype.storePoolAction = async function (type, pair, event) {
  let tx = await this.ethereum.getTransaction(event.transactionHash);
  let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);
  console.log(event);
  if (type == "SUB") {
    event.returnValues.value = "-" + event.returnValues.value;
    event.user = event.returnValues.to;
  } else if (type == "ADD") {
    event.user = event.returnValues.from;
  }
  let pa = {
    id: event.returnValues.tokenId,
    blocknumber: event.blockNumber,
    transactionhash: this.ethereum.normalizeHash(event.transactionHash),
    from: this.ethereum.normalizeHash(tx.from),
    to: this.ethereum.normalizeHash(tx.to),
    logindex: event.logIndex,
    timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
    nft: this.ethereum.normalizeHash(pair.nft),
    pool: this.ethereum.normalizeHash(pair.address),
    id: event.returnValues.id,
    amount: event.returnValues.value,
    user: this.ethereum.normalizeHash(event.user),
    network: this.NETWORK,
  };
  console.log(pa);
  await this.storage.insert("nft20_action", pa);
  try {
    await this.getNFT(
      this.ethereum.normalizeHash(pair.nft),
      event.returnValues.id
    );
  } catch (error) {
    console.log(this.ethereum.normalizeHash(pair.nft), event.returnValues);
    console.log(error);
    console.log("ERROR while adding NFT to db");
  }
};

NFT20.prototype.getLastData = async function (forceFromZero = false) {
  let latestBlock = await this.ethereum.getLatestBlock();
  let maxBlock = 13179140
  let chunk_size = 10000000000
  if (latestBlock - maxBlock > chunk_size) {
    console.log("We are really late and will run cunk by chunk (Usually happens on Matic)")
    let tmp_block = maxBlock
    while (tmp_block < latestBlock) {
      console.log("Getting chunk from ", tmp_block, tmp_block + chunk_size, "latest block == ", latestBlock);
      await this.getData(tmp_block, tmp_block + chunk_size);
      tmp_block += chunk_size
      console.log("Chunk ingested")
    }
  } else {
    if (this.NETWORK == 0) {

    }
    console.log("Starting getting data for block:", maxBlock, latestBlock);
    await this.getData(maxBlock, latestBlock);
    console.log("End data for block:", maxBlock, latestBlock);
  }

};

NFT20.prototype.fixMuseTransfers = async function () {
  let chunkJump = 1000;
  let latest = 12293556
  while (true) {
    console.log("FROM ", latest, latest + chunkJump)
    const museTransfers = await this.museContract.getPastEvents("Transfer", {
      fromBlock: latest - 10,
      toBlock: latest + chunkJump,
    });
    console.log("FOUND ", museTransfers.length)
    for (const t of museTransfers) {
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
      await this.storage.insert("muse_transfers", event);
    }
    latest += chunkJump
  }




}

NFT20.prototype.getNFT = async function (contract, asset_id) {
  let existing = await this.storage.getMulti("nft20_nft", {
    nft_contract: contract,
    nft_id: asset_id,
  });
  if (!existing) {
    console.log("INSERT NFT ", asset_id)
    if (this.NETWORK == 0) {
      await sleep(1200);
      let opensea_asset = null
      try {
        opensea_asset = await axios.get(
          "https://api.opensea.io/api/v1/asset/" + contract + "/" + asset_id + "/"
        );
      } catch (error) {
        console.log('ERROR GETTING NFT');
        let NFT = {
          nft_contract: contract,
          nft_id: asset_id,
        };
        await this.storage.insert("nft20_nft", NFT);
        return;
      }


      let NFT = {
        nft_contract: contract,
        nft_id: asset_id,
        nft_title: opensea_asset.data.name,
        nft_description: opensea_asset.data.description,
        nft_image: opensea_asset.data.image_url,
        nft_original_image: opensea_asset.data.image_original_url,
        nft_trait: JSON.stringify(opensea_asset.data.traits),
      };
      await this.storage.insert("nft20_nft", NFT);

      let collection = {
        contract_address: contract,
        image_url: opensea_asset.data.collection.image_url,
        collection_name: opensea_asset.data.collection.name,
        collection_description: opensea_asset.data.collection.description,
        external_url: opensea_asset.data.collection.external_url,
        collection_type:
          opensea_asset.data.asset_contract.schema_name == "ERC1155"
            ? 1155
            : 721,
        banner_url: opensea_asset.data.collection.banner_image_url,
        featured_image_url: opensea_asset.data.collection.featured_image_url,
        twitter_username: opensea_asset.data.collection.twitter_username,
        telegram_url: opensea_asset.data.collection.telegram_url,
        number_of_owners: opensea_asset.data.collection.stats.num_owners,
        collection_total_assets: opensea_asset.data.collection.stats.total_supply
      };
      console.log(collection)
      await this.storage
        .knex("nft20_collection")
        .insert(collection)
        .onConflict("contract_address")
        .merge();
    } else {
      let NFT = {
        nft_contract: contract,
        nft_id: asset_id,
        nft_title: "",
        nft_description: "",
        nft_image: "",
        nft_original_image: "",
        nft_trait: "{}",
      };
      await this.storage.insert("nft20_nft", NFT);

      let collection = {
        contract_address: contract,
        image_url: "",
        collection_name: "",
        collection_description: "",
        external_url: "",
        collection_type: 0,
      };
      await this.storage.insert("nft20_collection", collection);
    }
  }
};

NFT20.prototype.getAuctions = async function () {
  let maxAuction = await this.auction.methods.auctionId().call();
  maxAuction = parseInt(maxAuction);
  for (let index = 1; index <= maxAuction; index++) {
    try {
      let auctionInfos = await this.auction.methods
        .getAuctionByAuctionId(index)
        .call();
      console.log(auctionInfos);
      let o = {
        auction_id: auctionInfos._id,
        seller: this.ethereum.normalizeHash(auctionInfos._seller),
        pair: this.ethereum.normalizeHash(auctionInfos._nft20Pair),
        tokenid: auctionInfos._tokenId,
        starting_price: auctionInfos._startingPrice,
        ending_price: auctionInfos._endingPrice,
        starting_time: new Date(
          parseInt(auctionInfos._startedAt) * 1000
        ).toUTCString(),
        ending_time: new Date(
          parseInt(
            parseInt(auctionInfos._startedAt) + parseInt(auctionInfos._duration)
          ) * 1000
        ).toUTCString(),
        duration: parseInt(auctionInfos._duration) * 1000,
        ended: false,
        network: this.NETWORK,
      };
      await this.storage
        .knex("nft20_auctions")
        .insert(o)
        .onConflict("auction_id")
        .merge();
    } catch (error) {
      let o = {
        auction_id: index,
        ended: true,
      };
      await this.storage
        .knex("nft20_auctions")
        .insert(o)
        .onConflict("auction_id")
        .merge();
    }
  }
};

NFT20.prototype.getData = async function (
  blocknumber = 0,
  lastBlockNumber = "latest"
) {
  let pairs = await this.getPairs(true);
  let i = 0;
  for (const pair of pairs) {
    console.log(pair)

    console.log("Get events for pair", pair.name, blocknumber + " -> " + lastBlockNumber, i++, "/" + pairs.length, "@", pair.address);
    const TwentyContract = new this.ethereum.w3.eth.Contract(
      this.ERC20ABI,
      pair.address
    );
    let maxERC20Transfer = blocknumber;
    console.log("tx")
    /*
    let ts = await TwentyContract.getPastEvents("Transfer", {
      fromBlock: maxERC20Transfer,
      toBlock: lastBlockNumber,
    });
    console.log(ts)
    for (const event of ts) {
      let tx = await this.ethereum.getTransaction(event.transactionHash);
      let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);
      await this.storage.insert("nft20_erc20_transfers", {
        blocknumber: event.blockNumber,
        transactionhash: this.ethereum.normalizeHash(event.transactionHash),
        from: this.ethereum.normalizeHash(tx.from),
        to: this.ethereum.normalizeHash(tx.to),
        logindex: event.logIndex,
        timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
        nft: this.ethereum.normalizeHash(pair.nft),
        pool: this.ethereum.normalizeHash(pair.address),
        transfer_from: this.ethereum.normalizeHash(event.returnValues.from),
        transfer_to: this.ethereum.normalizeHash(event.returnValues.to),
        transfer_amount: event.returnValues.value,
      });
    }
    */
    if (blocknumber <= 0) {
      blocknumber = lastBlockNumber - 50000;
    }
    console.log(parseInt(pair.nft_type))
    if (parseInt(pair.nft_type) == 1155) {
      const nft = new this.ethereum.w3.eth.Contract(this.ERC1155ABI, pair.nft);
      console.log({
        fromBlock: blocknumber,
        toBlock: lastBlockNumber,
        filter: { to: pair.address },
      });
      let ts = await nft.getPastEvents("TransferSingle", {
        fromBlock: blocknumber,
        toBlock: lastBlockNumber,
        filter: { to: pair.address },
      });
      console.log(ts);
      for (const t of ts) {
        await this.storePoolAction("ADD", pair, t);
      }

      ts = await nft.getPastEvents("TransferSingle", {
        fromBlock: blocknumber,
        toBlock: lastBlockNumber,
        filter: { from: pair.address },
      });
      for (const t of ts) {
        await this.storePoolAction("SUB", pair, t);
      }
      console.log("evemt");

      ts = await nft.getPastEvents("TransferBatch", {
        fromBlock: blocknumber,
        toBlock: lastBlockNumber,
        filter: { to: pair.address },
      });

      for (const t of ts) {
        for (let index = 0; index < t.returnValues.ids.length; index++) {
          t.returnValues.id = t.returnValues.ids[index];
          t.returnValues.value = t.returnValues.values[index];
          await this.storePoolAction("ADD", pair, t);
        }
      }
      ts = await nft.getPastEvents("TransferBatch", {
        fromBlock: blocknumber,
        toBlock: lastBlockNumber,
        filter: { from: pair.address },
      });
      console.log(ts);
      for (const t of ts) {
        for (let index = 0; index < t.returnValues.ids.length; index++) {
          t.returnValues.id = t.returnValues.ids[index];
          t.returnValues.value = t.returnValues.values[index];
          await this.storePoolAction("SUB", pair, t);
        }
      }
    } else if (parseInt(pair.nft_type) == 721) {
      console.log("IT SI 721")
      let nft = new this.ethereum.w3.eth.Contract(this.ERC721ABI, pair.nft);
      
      let ts = await nft.getPastEvents("Transfer", {
        fromBlock: blocknumber,
        toBlock: lastBlockNumber,
        filter: { to: pair.address },
      });
      for (const t of ts) {
        t.returnValues.value = "1";
        await this.storePoolAction("ADD", pair, t);
      }

      ts = await nft.getPastEvents("Transfer", {
        fromBlock: blocknumber,
        toBlock: lastBlockNumber,
        filter: { from: pair.address },
      });
      for (const t of ts) {
        t.returnValues.value = "1";
        await this.storePoolAction("SUB", pair, t);
      }
    }
  }

};

module.exports = NFT20;
