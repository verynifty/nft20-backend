const axios = require("axios");
const BigNumber = require("bignumber.js");

const sleep = (waitTimeInMs) =>
    new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

function OSClient(storage) {
    this.q_list_address = require("../graph_requests/list_account");
    this.storage = storage
}

OSClient.prototype.getNFTs = async function (account, chain, collection_filter = null) {
    this.q_list_address.variables.identity.address = account;
    this.q_list_address.variables.assetOwner.address = account;
    let r = await axios.post("https://api.opensea.io/graphql/", this.q_list_address)
    let result = {
        nfts: [],
        collections: {}
    }
    for (const iter_nft of r.data.data.query.search.edges) {
        let os_nft = iter_nft.node.asset
        let nft = {
            nft_contract: os_nft.assetContract.account.address.toLowerCase(),
            nft_id: os_nft.tokenId,
            nft_image: os_nft.imageUrl,
            nft_original_image: os_nft.imageUrl,
            nft_title: os_nft.name,
            nft_description: os_nft.description,
        }
        if (this.storage != null) {
            await this.storage
                .insert("nft20_nft", nft)
        }
        nft.nft_owned = parseInt(os_nft.ownedQuantity),
        nft.nft_chain = os_nft.assetContract.account.chain.identifier.toLowerCase()
        let collecType = 721
        if (os_nft.assetContract.tokenStandard == "ERC1155") {
            collecType = 1155
        }
        let collection = {
            contract_address: os_nft.assetContract.account.address.toLowerCase(),
            image_url: os_nft.collection.imageUrl,
            collection_name: os_nft.collection.name,
            collection_description: os_nft.collection.description,
            collection_type: collecType
        }
        if (this.storage != null) {
            await this.storage
                .knex("nft20_collection")
                .insert(collection)
                .onConflict("contract_address")
                .merge();
        }
        if (collection_filter == null || collection_filter.toLowerCase() == nft.nft_contract) {
            result.nfts.push(nft);
            result.collections[collection.contract_address] = collection;
        }
    }
    return (result)
}


module.exports = OSClient;
