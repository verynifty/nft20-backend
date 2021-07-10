const axios = require("axios");
const BigNumber = require("bignumber.js");

const sleep = (waitTimeInMs) =>
    new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

function Pet(ethereum, storage) {
    this.ethereum = ethereum;
    this.storage = storage;
    this.ERC20ABI = require("../../contracts/ERC20.abi");
    this.PETABI = require("../../contracts/pet.abi"); //TODO set ABI
    this.pet = new ethereum.w3.eth.Contract( //TODO set address
        this.PETABI,
        "" 
    );
}


/* Sidenotes TODO:

* Add event to giveLife giveLife(newId)
* Add event to bonk
* Add event to fatality
* Add event to feed
* add caretaker to getPetInfo

*/

Pet.prototype.run = async function() {
    let maxBlock = await this.ethereum.getLatestBlock();
    let minBlock = await this.storage.getMax("pet", "blocknumber");

}

Pet.prototype.updatePet = async function(playerId) {
    if (id == null) {
        return;
    }
    let infos = await this.pet.methods.getInfo(playerId).call();
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
    .knex("pet_item")
    .insert(player)
    .onConflict("player_id")
    .merge();
}

module.exports = Pet;
