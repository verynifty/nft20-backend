const axios = require("axios");
const BigNumber = require("bignumber.js");

const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

function Game(ethereum, storage) {
  this.ethereum = ethereum;
  this.storage = storage;
  this.ERC20ABI = require("../../contracts/ERC20.abi");
  
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
        collection_type: opensea_asset.data.asset_contract.schema_name == "ERC1155"? 1155: 721
      }
      await this.storage.insert("nft20_collection", collection);
  
    }
  };

module.exports = Game;
