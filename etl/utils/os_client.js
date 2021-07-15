const axios = require("axios");
const BigNumber = require("bignumber.js");

const sleep = (waitTimeInMs) =>
    new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

function OSClient(storage) {
    this.q_list_address = require("../graph_requests/list_account");
    this.q_single_nft = require("../graph_requests/single_nft");
    this.q_all_collections = require("../graph_requests/all_collections");
    this.storage = storage
}

OSClient.prototype.getNFTs = async function (account, chain, collection_filter = null) {
    this.q_list_address.variables.identity.address = account;
    this.q_list_address.variables.assetOwner.address = account;
    this.q_list_address.variables.cursor = null;
    let result = {
        nfts: [],
        collections: {}
    }
    let run_query = true;
    while (run_query) {

        let r = await axios.post("https://api.opensea.io/graphql/", this.q_list_address)

        for (const iter_nft of r.data.data.query.search.edges) {
            let os_nft = iter_nft.node.asset
            if (os_nft == null) {
                continue;
            }
            //console.log(os_nft)
            let nft = {
                nft_contract: os_nft.assetContract.account.address.toLowerCase(),
                nft_id: os_nft.tokenId,
                nft_image: os_nft.imageUrl,
                nft_original_image: os_nft.imageUrl,
                nft_title: os_nft.name,
                nft_description: os_nft.description,
            }
         /*   if (this.storage != null) {
                await this.storage
                    .insert("nft20_nft", nft)
            } */
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
           /* if (this.storage != null) {
                await this.storage
                    .knex("nft20_collection")
                    .insert(collection)
                    .onConflict("contract_address")
                    .merge();
            } */
            if (nft.nft_chain == chain && (collection_filter == null || (collection_filter.toLowerCase() == nft.nft_contract))) {
                result.nfts.push(nft);
                result.collections[collection.contract_address] = collection;
            }

        }
        console.log(r.data.data.query.search.pageInfo)
        if (r.data.data.query.search.pageInfo.hasNextPage && r.data.data.query.search.pageInfo.endCursor) {
            this.q_list_address.variables.cursor = r.data.data.query.search.pageInfo.endCursor
        } else {
            run_query = false;
        }

    }
    return (result)
}

OSClient.prototype.getNFT = async function (nft_contract, nft_id) {
    this.q_single_nft.variables.archetype.assetContractAddress = nft_contract;
    this.q_single_nft.variables.archetype.tokenId = nft_id;
    let r = await axios.post("https://api.opensea.io/graphql/", this.q_single_nft)
    if (r.data.data == null) {
        return null;
    }
    let os_nft = r.data.data.archetype.asset
    if (os_nft == null) {
        return null;
    }
    let nft = {
        nft_contract: nft_contract.toLowerCase(),
        nft_id: nft_id,
        nft_image: os_nft.imageUrl,
        nft_original_image: os_nft.imageUrl,
        nft_title: os_nft.name,
        nft_description: os_nft.description,
    }
    console.log(nft)
    await this.storage
        .knex("nft20_nft")
        .insert(nft)
        .onConflict(["nft_contract", "nft_id"])
        .merge();
}

OSClient.prototype.getStats = async function () {
    let r = await axios.post("https://api.opensea.io/graphql/", this.q_all_collections)
    if (r.data.data == null) {
        return;
    }
    let all_collections = r.data.data.collections.edges;
    for (const collection of all_collections) {
        if (collection.node.assetContracts.edges.length > 1) {
            console.log("TOO MUCH ITEMS")
            console.log(collection.node.assetContracts.edges)
        }
        //console.log(collection.node.assetContracts.edges)
    }
    return (all_collections);
}


module.exports = OSClient;
