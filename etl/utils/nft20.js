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
  this.counter++
  if (this.counter % 2 == 0) {
    await this.storage.executeAsync('REFRESH MATERIALIZED VIEW concurrently nft20_price_summary_view')
  }
  let pairs = [];
  let pairCount = parseInt(await this.factory.methods.counter().call());
  let assets;
  if (this.NETWORK == 0) {
    assets = await axios.get(
      "https://raw.githubusercontent.com/verynifty/nft20-assets/master/assets.json"
    );

  } else if (this.NETWORK == 1) {
    assets = await axios.get(
      "https://raw.githubusercontent.com/verynifty/nft20-assets/master/assets_matic.json"
    );
  }
  let price_of_eth = await this.ethereum.getPrice();
  console.log("Current ETH price", price_of_eth);

  for (let index = 0; index < pairCount; index++) {
    let pairDetail = await this.factory.methods
      .getPairByNftAddress(index)
      .call();

    let pairOnGithub = assets.data.filter(
      (asset) => asset.symbol == pairDetail._symbol
    );
    if (pairOnGithub != null && pairOnGithub[0] != null) {
      pairOnGithub = pairOnGithub[0];
    } else {
      pairOnGithub = null;
    }

    let balance = 0;
    let ethPrice = 0;
    let buyPrice = 0;
    let sellPrice = 0;
    let lp_version = null;
    let lp_fee = null;
    let hidden = false;
    let logo_url =
      "https://space-cdn-dokomaps.fra1.digitaloceanspaces.com/nft20/placeholder.png";
    if (pairOnGithub) {
      if (pairOnGithub.hide != null && pairOnGithub.hide == true) {
        hidden = true;
      }
      if (pairOnGithub.logo != null && pairOnGithub.logo != null) {
        logo_url = pairOnGithub.logo;
      }
    }
    const TwentyContract = new this.ethereum.w3.eth.Contract(
      this.PAIRABI,
      pairDetail._nft20pair
    );
    let nftValue = await TwentyContract.methods.nftValue().call();

    nftValue = new BigNumber(nftValue).shiftedBy(-18).toNumber();
    if (pairOnGithub && pairOnGithub.lpToken != null && pairOnGithub.lpToken) {
      let wethContract
      if (this.NETWORK == 0) {
        wethContract = new this.ethereum.w3.eth.Contract(
          this.ERC20ABI,
          "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
        );
      } else if (this.NETWORK == 1) {
        wethContract = new this.ethereum.w3.eth.Contract(
          this.ERC20ABI,
          "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619" //MATIC WETH
        );
      }
      console.log(pairDetail._name)
      if (pairOnGithub.uniswap_v3) {
        lp_version = 3;
        if (pairOnGithub.lp_fees != null) {
          lp_fee = pairOnGithub.lp_fees;
        } else {
          lp_fee = 10000; // default to 0.1%
        }
      } else {
        lp_version = 2;
      }

      // console.log(price_of_eth);
      balance = await wethContract.methods
        .balanceOf(pairOnGithub.lpToken)
        .call();
      balance = new BigNumber(balance).shiftedBy(-18).toNumber();
      Twentybalance = await TwentyContract.methods
        .balanceOf(pairOnGithub.lpToken)
        .call();

      Twentybalance = new BigNumber(Twentybalance).shiftedBy(-18).toNumber();
      console.log(Twentybalance);
      if (pairDetail._symbol == "AAH") {
        ethPrice = (balance * 1052631.5) / Twentybalance;
      } else {
        ethPrice = (balance * 100) / Twentybalance;
        let amount = new BigNumber(100000000000000000000).toFixed()
        if (lp_version == 2) {
          if (this.NETWORK == 0 && this.uniRouter != null) {
            try {

              // We calculate the price of one NFT with the slippage

              let result = await this.uniRouter.methods
                .getAmountsIn(amount + "", [
                  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", //WETH
                  pairDetail._nft20pair
                ])
                .call();
              buyPrice = new BigNumber(result[0]).shiftedBy(-18).toNumber();

            } catch (error) {
              console.log("Slippage does not work")
            }

            try {
              // We calculate the price of one NFT with the slippage
              let result = await this.uniRouter.methods
                .getAmountsOut(amount + "", [
                  pairDetail._nft20pair,
                  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" //WETH
                ])
                .call();
              sellPrice = new BigNumber(result[1]).shiftedBy(-18).toNumber();

            } catch (error) {
              console.log("Slippage does not work")
            }
          }
        } else {
          if (this.NETWORK == 0 && this.uniQuoterV3 != null) {
            try {
              // This is how much eth to get 100 tokens
              let result = await this.uniQuoterV3.methods.quoteExactOutputSingle(
                "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", //WETH
                pairDetail._nft20pair,
                lp_fee,
                amount + "",
                0
              ).call()
              console.log("RESSSULT = ", result / 1e18)
              sellPrice = new BigNumber(result).shiftedBy(-18).toNumber();
            } catch (error) {
              console.log("Slippage does not work v3", error)
            }
            try {
              // This is how much eth we get to sell 100 tokens
              let result = await this.uniQuoterV3.methods.quoteExactInputSingle(
                pairDetail._nft20pair,
                "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", //WETH
                lp_fee,
                amount + "",
                0
              ).call()
              console.log("RESSSULT = ", result / 1e18)
              buyPrice = new BigNumber(result).shiftedBy(-18).toNumber();
            } catch (error) {
              console.log("Slippage does not work v3", error)
            }
            if (buyPrice == 0 && sellPrice == 0) {
              ethPrice = 0;
            } else {

            }
          }
        }
        if (buyPrice != 0 && sellPrice != 0 && this.counter % 4 == 0) {
          await this.storage
            .knex("nft20_price_feed")
            .insert({
              nft_address: this.ethereum.normalizeHash(pairDetail._originalNft),
              eth_buy_price: buyPrice,
              eth_sell_price: sellPrice,
              usd_buy_price: buyPrice * price_of_eth,
              usd_sell_price: sellPrice * price_of_eth,
              time: this.storage.knex.fn.now()
            })
        }
      }


    }
    let collection = await this.storage.get('nft20_collection', 'contract_address', pairDetail._originalNft.toLowerCase());
    if (collection != null && collection.image_url != null && collection.image_url != "") {
      logo_url = collection.image_url;
    }
    if (ethPrice == Infinity) {
      ethPrice = 0;
    }
    let o = {
      address: this.ethereum.normalizeHash(pairDetail._nft20pair),
      nft: this.ethereum.normalizeHash(pairDetail._originalNft),
      nft_type: pairDetail._type,
      name: pairDetail._name,
      symbol: pairDetail._symbol,
      lp_eth_balance: balance,
      lp_usd_balance: balance * price_of_eth * 2,
      nft_eth_price: ethPrice,
      nft_usd_price: ethPrice * price_of_eth,
      hidden: hidden,
      logo_url: logo_url,
      nft_value: nftValue,
      network: this.NETWORK,
      buy_price_eth: buyPrice,
      sell_price_eth: sellPrice,
      lp_version: lp_version,
      lp_fee: lp_fee,
      index_order: index
    };
    await this.storage
      .knex("nft20_pair")
      .insert(o)
      .onConflict("address")
      .merge();
    pairs.push(o);
  }
  console.log(pairs);
  return pairs;
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
  let maxBlock = await this.storage.getMaxWhere("nft20_action", "blocknumber", {
    network: this.NETWORK,
  });
  if (maxBlock == null) {
    maxBlock = 0;
  } else {
    maxBlock = maxBlock - 100;
    latestBlock = latestBlock - 2; // Protect from reorg
  }
  if (forceFromZero) {
    maxBlock = 13068603;
  }
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
      try {
        const museTransfers = await this.museContract.getPastEvents("Transfer", {
          fromBlock: maxBlock,
          toBlock: latestBlock,
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
      } catch (error) {

      }

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
  console.log("ok")
  let existing = await this.storage.getMulti("nft20_nft", {
    nft_contract: contract,
    nft_id: asset_id,
  });
  if (!existing || (existing.nft_image == null && existing.nft_title == null)) {
    if (this.NETWORK == 0) {
      await sleep(1200);
      let opensea_asset = null
      try {
        opensea_asset = await axios.get(
          "https://api.opensea.io/api/v2/chain/ethereum/contract/" + contract + "/nfts/" + asset_id + "",
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0.1; SM-G920V Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.98 Mobile Safari/537.36',
              'X-Api-Key': '24f66ac0d61f425291793bc376c54ad8'
            }
          }
        );
        console.log(opensea_asset);
      } catch (error) {
        console.log('ERROR GETTING NFT');
        console.log(error)
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
        nft_title: opensea_asset.data.nft.name,
        nft_description: opensea_asset.data.nft.description,
        nft_image: opensea_asset.data.nft.display_image_url,
        nft_original_image: opensea_asset.data.nft.display_image_url,
        nft_trait: JSON.stringify(opensea_asset.data.nft.traits),
      };
      console.log("New NFT")
      await this.storage.knex("nft20_nft").insert(NFT).onConflict(["nft_contract", "nft_id"]).merge();
/*
      let collection = {
        contract_address: contract,
        image_url: opensea_asset.data.nft.image_url,
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
      console.log("New NFT", collection)
      await this.storage
        .knex("nft20_collection")
        .insert(collection)
        .onConflict("contract_address")
        .merge();
        */
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
  /*
  let pairs = [{
    name: "MEME LTD",
    address: "0x60acd58d00b2bcc9a8924fdaa54a2f7c0793b3b2"
  }]
  */
  let i = 0;
  for (const pair of pairs) {

    console.log("Get events for pair", pair.name, blocknumber + " -> " + lastBlockNumber, i++, "/" + pairs.length, "@", pair.address);
    const TwentyContract = new this.ethereum.w3.eth.Contract(
      this.ERC20ABI,
      pair.address
    );
    let maxERC20Transfer = blocknumber;
    //console.log("Try to get events")
    let ts = await TwentyContract.getPastEvents("Transfer", {
      fromBlock: maxERC20Transfer,
      toBlock: lastBlockNumber,
    });
    //console.log("got events", ts.length)
    for (const event of ts) {
      let tx = await this.ethereum.getTransaction(event.transactionHash);
      let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);
      console.log("trsft", 
      {
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
      })
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

    if (blocknumber <= 0) {
      blocknumber = lastBlockNumber - 50000;
    }
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
      let nft = new this.ethereum.w3.eth.Contract(this.ERC721ABI, pair.nft);
      if (pair.name == "NFT20 CryptoCrystal") {
        nft = new this.ethereum.w3.eth.Contract(
          this.ERC721ABICRYSTAL,
          pair.nft
        );
      }
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
  if (this.NETWORK == 0) {
    //await this.getAuctions();
    /*
    await this.storage.executeAsync(
      "REFRESH MATERIALIZED VIEW CONCURRENTLY nft20_user_view"
    );
     */
  }
};

module.exports = NFT20;
