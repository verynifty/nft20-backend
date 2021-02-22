const axios = require("axios");
const BigNumber = require("bignumber.js");


function NFT20(ethereum, storage) {
    this.ethereum = ethereum;
    this.DEPLOYED_BLOCK = 11023280;
    this.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    this.ERC20ABI = require("../../contracts/ERC20.abi");
    this.ERC1155ABI = require("../../contracts/ERC1155.abi");
    this.ERC721ABI = require("../../contracts/ERC721.abi");

    this.AUCTIONABI = require("../../contracts/Auction.abi");
    this.PAIRABI = require("../../contracts/Pair.abi");
    this.FACTORYABI = require("../../contracts/Factory.abi");

    this.factory = new ethereum.w3.eth.Contract(this.FACTORYABI, "0x0f4676178b5c53ae0a655f1b19a96387e4b8b5f2");

    this.storage = storage;
    this.abiDecoder = require("abi-decoder");
    this.abiDecoder.addABI(this.FACTORYABI);
}

NFT20.prototype.getPairs = async function (withUpdate = false) {
    let pairs = []
    let pairCount = parseInt(await this.factory.methods.counter().call());
    let assets = await axios.get(
        "https://raw.githubusercontent.com/verynifty/nft20-assets/master/assets.json"
    );
    let price_of_eth = await this.ethereum.getPrice();
    console.log("Current ETH price", price_of_eth)
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
        if (pairOnGithub && pairOnGithub.lpToken != null) {
            const wethContract = new this.ethereum.w3.eth.Contract(
                this.ERC20ABI,
                "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
            );
            const TwentyContract = new this.ethereum.w3.eth.Contract(
                this.ERC20ABI,
                pairDetail._nft20pair
            );
            console.log(price_of_eth)
            balance = await wethContract.methods.balanceOf(pairOnGithub.lpToken).call();
            balance = new BigNumber(balance).shiftedBy(-18).toNumber()
            Twentybalance = await TwentyContract.methods.balanceOf(pairOnGithub.lpToken).call();
            Twentybalance = new BigNumber(Twentybalance).shiftedBy(-18).toNumber()
            ethPrice = balance * 100 / Twentybalance;
        }
        if (withUpdate) {
            /* todo insert or update pair */
        }
        let o = {
            address: this.ethereum.normalizeHash(pairDetail._nft20pair),
            nft: this.ethereum.normalizeHash(pairDetail._originalNft),
            nft_type: pairDetail._type,
            name: pairDetail._name,
            symbol: pairDetail._symbol,
            lp_eth_balance: balance,
            lp_usd_balance: balance * price_of_eth,
            nft_eth_price: ethPrice,
            nft_usd_price: ethPrice * price_of_eth,
        }
        await this.storage.knex('nft20_pair')
            .insert(o)
            .onConflict('address')
            .merge()
        pairs.push(o)
    }
    return pairs;
};

NFT20.prototype.storePoolAction = async function (type, pair, event) {
    let tx = await this.ethereum.getTransaction(event.transactionHash);
    let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);
    if (type == "SUB") {
        event.returnValues.value = "-" + event.returnValues.value;
        event.user = event.returnValues.to
    } else if (type == "ADD") {
        event.user = event.returnValues.from
    }
    let pa = {
        id: event.returnValues.tokenId,
        blocknumber: event.blockNumber,
        transactionhash: "0x" + this.ethereum.normalizeHash(event.transactionHash),
        from: this.ethereum.normalizeHash(tx.from),
        to: this.ethereum.normalizeHash(tx.to),
        logindex: event.logIndex,
        timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
        nft: this.ethereum.normalizeHash(pair.nft),
        pool: this.ethereum.normalizeHash(pair.address),
        id: event.returnValues.id,
        amount: event.returnValues.value,
        user: this.ethereum.normalizeHash(event.user)
    };
    await this.storage.insert("nft20_action", pa);
    try {
        await this.getNFT(this.ethereum.normalizeHash(pair.nft), event.returnValues.id)
    } catch (error) {
        console.log("ERROR while adding NFT to db")
    }
}

NFT20.prototype.getLastData = async function () {
    let maxBlock = await this.storage.getMax("nft20_action", "blocknumber");
    if (maxBlock == null) {
        maxBlock = 0;
    }
    console.log("Starting getting data for block:", maxBlock)
    await this.getData(maxBlock)
    console.log("End data for block:", maxBlock)

}

NFT20.prototype.getNFT = async function (contract, asset_id) {
    let existing = await this.storage.getMulti("nft20_nft", {
        nft_contract: contract,
        nft_id: asset_id
    })
    if (!existing) {
        console.log( "https://api.opensea.io/api/v1/asset/" + contract + "/" + asset_id + "/")
        let opensea_asset = await axios.get(
            "https://api.opensea.io/api/v1/asset/" + contract + "/" + asset_id + "/"
        );
        let NFT = {
            nft_contract: contract,
            nft_id: asset_id,
            nft_title: opensea_asset.data.name,
            nft_description: opensea_asset.data.description,
            nft_image: opensea_asset.data.image_url,
            nft_original_image: opensea_asset.data.image_original_url,
        }
        await this.storage.insert("nft20_nft", NFT);
    }
}

NFT20.prototype.getData = async function (blocknumber = 0) {
    let pairs = await this.getPairs(true)
    for (const pair of pairs) {
        console.log("Get events for pair", pair.name, blocknumber)
        if (parseInt(pair.nft_type) == 1155) {
            const nft = new this.ethereum.w3.eth.Contract(
                this.ERC1155ABI,
                pair.nft
            );

            let ts = await nft.getPastEvents("TransferSingle", {
                fromBlock: blocknumber,
                toBlock: "latest",
                filter: { to: pair.address }
            });
            for (const t of ts) {
                await this.storePoolAction("ADD", pair, t);
            }

            ts = await nft.getPastEvents("TransferSingle", {
                fromBlock: blocknumber,
                toBlock: "latest",
                filter: { from:  pair.address }
            });
            for (const t of ts) {
                await this.storePoolAction("SUB", pair, t);
            }

            ts = await nft.getPastEvents("TransferBatch", {
                fromBlock: blocknumber,
                toBlock: "latest",
                filter: { to:  pair.address }
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
                toBlock: "latest",
                filter: { from: pair.address }
            });
            for (const t of ts) {
                for (let index = 0; index < t.returnValues.ids.length; index++) {
                    t.returnValues.id = t.returnValues.ids[index];
                    t.returnValues.value = t.returnValues.values[index];
                    await this.storePoolAction("SUB", pair, t);
                }
            }


        } else if (parseInt(pair.nft_type) == 721) {
            const nft = new this.ethereum.w3.eth.Contract(
                this.ERC721ABI,
                pair.nft
            );

            let ts = await nft.getPastEvents("Transfer", {
                fromBlock: blocknumber,
                toBlock: "latest",
                filter: { to: pair.address }
            });
            for (const t of ts) {
                t.returnValues.value = "1"
                await this.storePoolAction("ADD", pair, t);
            }

            ts = await nft.getPastEvents("Transfer", {
                fromBlock: blocknumber,
                toBlock: "latest",
                filter: { from: pair.address }
            });
            for (const t of ts) {
                t.returnValues.value = "1"
                await this.storePoolAction("ADD", pair, t);
            }
        }
    }
};

module.exports = NFT20;



