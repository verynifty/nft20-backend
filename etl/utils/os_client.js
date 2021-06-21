const axios = require("axios");
const BigNumber = require("bignumber.js");

const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

function OSClient() {
}

OSClient.prototype.getNFTs(account, chain, collection = null) {
    
}


module.exports = OSClient;
