const axios = require("axios");
const BigNumber = require("bignumber.js");

const sleep = (waitTimeInMs) =>
    new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

function Game(ethereum, storage) {
    this.ethereum = ethereum;
    this.storage = storage;
    this.ERC20ABI = require("../../contracts/ERC20.abi");
    this.GAMEABI = require("../../contracts/Game.abi");
    this.game = new ethereum.w3.eth.Contract(
        this.GAMEABI,
        "0x0f4676178b5c53ae0a655f1b19a96387e4b8b5f2" // TODO change address
    );
}

GAME.prototype.get = async function (playerId, setDead = false) {
    let infos = await this.game.methods.getInfo(playerId).call();
    let player = {
        player_id: infos._playerId,
        is_alive: infos._isAlive,
        score: infos._score,
        expected_reward: infos._expectedReward,
        time_until_death: infos._timeUntilDeath,
        time_born: setDead == false ? new Date(parseInt(infos._timeBorn * 1000)).toUTCString() : null,
        owner: this.ethereum.normalizeHash(infos._owner),
        nft_contract: this.ethereum.normalizeHash(infos._nftOrigin),
        nft_id: infos._nftId,
        tod: new Date(parseInt(infos._timeOfDeath * 1000)).toUTCString()
    }
    await this.storage
        .knex("game_players")
        .insert(player)
        .onConflict("player_id")
        .merge();
}

GAME.prototype.run = async function (forceFromZero = false) {
    let maxBlock = await this.ethereum.getLatestBlock();
    let minBlock = await this.storage.getMax("game_action", "blocknumber");
    if (forceFromZero) {
        minBlock = 0;
    }
    let events = null;
    events = await this.game.getPastEvents("ClaimedRewards", {
        fromBlock: minBlock,
        toBlock: maxBlock,
    });
    for (const event of events) {
        let tx = await this.ethereum.getTransaction(event.transactionHash);
        let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);
        await this.storage.insert("game_claims", {
            blocknumber: event.blockNumber,
            transactionhash: this.ethereum.normalizeHash(event.transactionHash),
            from: this.ethereum.normalizeHash(tx.from),
            to: this.ethereum.normalizeHash(tx.to),
            logindex: event.logIndex,
            timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
            who: this.ethereum.normalizeHash(event.returnValues.who),
            amount: event.returnValues.amount
        });
    }
    events = await this.game.getPastEvents("NewPlayer", {
        fromBlock: minBlock,
        toBlock: maxBlock,
    });
    for (const event of events) {
        await this.get(event.returnValues.id);
    }
    events = await this.game.getPastEvents("Kill", {
        fromBlock: minBlock,
        toBlock: maxBlock,
    });
    for (const event of events) {
        let tx = await this.ethereum.getTransaction(event.transactionHash);
        let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);
        await this.storage.insert("game_kill", {
            blocknumber: event.blockNumber,
            transactionhash: this.ethereum.normalizeHash(event.transactionHash),
            from: this.ethereum.normalizeHash(tx.from),
            to: this.ethereum.normalizeHash(tx.to),
            logindex: event.logIndex,
            timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
            killer: this.ethereum.normalizeHash(event.returnValues.killer),
            victim: event.returnValues.opponentId
        });
        await this.get(event.returnValues.id, true);
    }
    events = await this.game.getPastEvents("Attak", {
        fromBlock: minBlock,
        toBlock: maxBlock,
    });
    for (const event of events) {
        let tx = await this.ethereum.getTransaction(event.transactionHash);
        let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);
        await this.storage.insert("game_attack", {
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
        await this.get(event.returnValues.id);
    }
    events = await this.game.getPastEvents("BuyPowerUp", {
        fromBlock: minBlock,
        toBlock: maxBlock,
    });
    for (const event of events) {
        let tx = await this.ethereum.getTransaction(event.transactionHash);
        let timestamp = await this.ethereum.getBlockTimestamp(event.blockNumber);
        await this.storage.insert("game_buy", {
            blocknumber: event.blockNumber,
            transactionhash: this.ethereum.normalizeHash(event.transactionHash),
            from: this.ethereum.normalizeHash(tx.from),
            to: this.ethereum.normalizeHash(tx.to),
            logindex: event.logIndex,
            timestamp: new Date(parseInt(timestamp * 1000)).toUTCString(),
            player: event.returnValues.to,
            amount: event.returnValues.amount
        });
        await this.get(event.returnValues.to);
    }
}


Game.prototype.getNFT = async function (contract, asset_id) {
    let existing = await this.storage.getMulti("nft20_nft", {
        nft_contract: contract,
        nft_id: asset_id,
    });
    if (!existing) {
        await sleep(1200)
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
            nft_trait: JSON.stringify(opensea_asset.data.traits),
        };
        await this.storage.insert("nft20_nft", NFT);

        let collection = {
            contract_address: contract,
            image_url: opensea_asset.data.collection.image_url,
            collection_name: opensea_asset.data.collection.name,
            collection_description: opensea_asset.data.collection.description,
            external_url: opensea_asset.data.collection.external_url,
            collection_type: opensea_asset.data.asset_contract.schema_name == "ERC1155" ? 1155 : 721
        }
        await this.storage.insert("nft20_collection", collection);

    }
};

module.exports = Game;
