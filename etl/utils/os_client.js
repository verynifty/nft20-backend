const axios = require("axios");
const BigNumber = require("bignumber.js");

const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

function OSClient() {
    this.q_list_address = require("../graph_requests/list_account");

}

OSClient.prototype.getNFTs = async function(account, chain, collection = null) {
    let r = await axios.post("https://api.opensea.io/graphql/",q_list_address)
    console.log(r.data.data.query.search.edges)
    for (const iter_nft of r.data.data.query.search.edges) {
        let os_nft = iter_nft.node.asset
        let nft = {
            nft_contract: os_nft.assetContract.account.address.toLowerCase(),
            nft_id: os_nft.tokenId,
            nft_image: os_nft.imageUrl,
            nft_original_image: os_nft.imageUrl,
            nft_title: os_nft.name,
            nft_description: os_nft.description,
            nft_owned: parseInt(os_nft.ownedQuantity)
        }
      //  console.log(os_nft)
        console.log(nft)
    }
}


module.exports = OSClient;
