const Web3 = require('web3');
const CoinGecko = require('coingecko-api');
const axios = require("axios");

function Ethereum(provider_url) {
    this.w3 = new Web3(new Web3.providers.HttpProvider(provider_url));
}

Ethereum.prototype.normalizeHash = function (hash) {
    if (hash != null && hash.startsWith("0x")) {
        var res = hash.toLowerCase();
        if (res.length == 0) {
            return (null);
        }
        return (res);
    }
    if (hash != null && hash.length > 0) {
        return (hash);
    }
    return (null);
}

Ethereum.prototype.getLatestBlock = async function () {
    var latestBlock = await this.w3.eth.getBlockNumber();
    return (latestBlock - 1);
}

Ethereum.prototype.getBlockTimestamp = async function (blocknumber) {
    var latestBlock = await this.w3.eth.getBlock(blocknumber);
    return (latestBlock.timestamp);
}

Ethereum.prototype.getTransaction = async function (hash, full) {
    let transaction = await this.w3.eth.getTransaction(hash)
    if (full) {
        let receipt = await this.w3.eth.getTransactionReceipt(hash)
        transaction = Object.assign(transaction, receipt)
    }
    return (transaction)
}

/*
Ethereum.prototype.getPrice = async function () {
    const CoinGeckoClient = new CoinGecko();
    const coingeckoRes = await CoinGeckoClient.simple.price({
        ids: ["ethereum"],
        vs_currencies: ["usd"],
    });
    let price = coingeckoRes.data.ethereum.usd;
    return (price);
}
*/

Ethereum.prototype.getPrice = async function () {
    let rates = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD`);
    return (rates.data.USD);
}

Ethereum.prototype.getWeb3 = function () {
    return (this.w3);
}


module.exports = Ethereum;