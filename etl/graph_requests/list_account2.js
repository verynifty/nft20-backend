module.exports = {
    "id": "AssetSearchQuery", "query": `query AssetSearchQuery(
    $categories: [CollectionSlug!]
    $chains: [ChainScalar!]
    $collection: CollectionSlug
    $collectionQuery: String
    $collectionSortBy: CollectionSort
    $collections: [CollectionSlug!]
    $count: Int
    $cursor: String
    $identity: IdentityInputType
    $includeHiddenCollections: Boolean
    $numericTraits: [TraitRangeType!]
    $paymentAssets: [PaymentAssetSymbol!]
    $priceFilter: PriceFilterType
    $query: String
    $resultModel: SearchResultModel
    $showContextMenu: Boolean = false
    $shouldShowQuantity: Boolean = false
    $sortAscending: Boolean
    $sortBy: SearchSortBy
    $stringTraits: [TraitInputType!]
    $toggles: [SearchToggle!]
    $creator: IdentityInputType
    $assetOwner: IdentityInputType
    $isPrivate: Boolean
    $safelistRequestStatuses: [SafelistRequestStatus!]
  ) {
    query {
      ...AssetSearch_data_2hBjZ1
    }
  }
  
  fragment AssetCardContent_asset on AssetType {
    relayId
    name
    ...AssetMedia_asset
    assetContract {
      address
      chain
      openseaVersion
      id
    }
    tokenId
    collection {
      slug
      id
    }
    isDelisted
  }
  
  fragment AssetCardContent_assetBundle on AssetBundleType {
    assetQuantities(first: 18) {
      edges {
        node {
          asset {
            relayId
            ...AssetMedia_asset
            id
          }
          id
        }
      }
    }
  }
  
  fragment AssetCardFooter_assetBundle on AssetBundleType {
    name
    assetCount
    assetQuantities(first: 18) {
      edges {
        node {
          asset {
            collection {
              name
              relayId
              isVerified
              id
            }
            id
          }
          id
        }
      }
    }
    assetEventData {
      lastSale {
        unitPriceQuantity {
          ...AssetQuantity_data
          id
        }
      }
    }
    orderData {
      bestBid {
        orderType
        paymentAssetQuantity {
          ...AssetQuantity_data
          id
        }
      }
      bestAsk {
        closedAt
        orderType
        dutchAuctionFinalPrice
        openedAt
        priceFnEndedAt
        quantity
        decimals
        paymentAssetQuantity {
          quantity
          ...AssetQuantity_data
          id
        }
      }
    }
  }
  
  fragment AssetCardFooter_asset_fdERL on AssetType {
    ownedQuantity(identity: $identity) @include(if: $shouldShowQuantity)
    name
    tokenId
    collection {
      name
      isVerified
      id
    }
    hasUnlockableContent
    isDelisted
    isFrozen
    assetContract {
      address
      chain
      openseaVersion
      id
    }
    assetEventData {
      firstTransfer {
        timestamp
      }
      lastSale {
        unitPriceQuantity {
          ...AssetQuantity_data
          id
        }
      }
    }
    decimals
    orderData {
      bestBid {
        orderType
        paymentAssetQuantity {
          ...AssetQuantity_data
          id
        }
      }
      bestAsk {
        closedAt
        orderType
        dutchAuctionFinalPrice
        openedAt
        priceFnEndedAt
        quantity
        decimals
        paymentAssetQuantity {
          quantity
          ...AssetQuantity_data
          id
        }
      }
    }
  }
  
  fragment AssetCardHeader_data_27d9G3 on AssetType {
    relayId
    favoritesCount
    isDelisted
    isFavorite
    ...AssetContextMenu_data_3z4lq0 @include(if: $showContextMenu)
  }
  
  
  
  fragment asset_url on AssetType {
    assetContract {
      address
      chain
      id
    }
    tokenId
  }
  
  fragment bundle_url on AssetBundleType {
    slug
  }
  
  fragment itemEvents_data on AssetType {
    assetContract {
      address
      chain
      id
    }
    tokenId
  }
  "`,
    "variables": { "categories": null, "chains": null, "collection": null, "collectionQuery": null, "collectionSortBy": "ASSET_COUNT", "collections": [], "count": 10, "cursor": null, "identity": { "address": "0x4b5922abf25858d012d12bb1184e5d3d0b6d6be4" }, "includeHiddenCollections": false, "numericTraits": null, "paymentAssets": null, "priceFilter": null, "query": "", "resultModel": "ASSETS", "showContextMenu": true, "shouldShowQuantity": true, "sortAscending": null, "sortBy": "LAST_TRANSFER_DATE", "stringTraits": null, "toggles": null, "creator": null, "assetOwner": { "address": "0x4b5922abf25858d012d12bb1184e5d3d0b6d6be4" }, "isPrivate": false, "safelistRequestStatuses": null }
  }
  
  
  
  
  
  
  
  