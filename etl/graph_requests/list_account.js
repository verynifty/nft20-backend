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

fragment AssetContextMenu_data_3z4lq0 on AssetType {
  ...asset_edit_url
  ...itemEvents_data
  isDelisted
  isEditable {
    value
    reason
  }
  isListable
  ownership(identity: {}) {
    isPrivate
    quantity
  }
  creator {
    address
    id
  }
  collection {
    isAuthorizedEditor
    id
  }
}

fragment AssetMedia_asset on AssetType {
  animationUrl
  backgroundColor
  collection {
    displayData {
      cardDisplayStyle
    }
    id
  }
  isDelisted
  displayImageUrl
}

fragment AssetQuantity_data on AssetQuantityType {
  asset {
    ...Price_data
    id
  }
  quantity
}

fragment AssetSearchFilter_data_3KTzFc on Query {
  ...CollectionFilter_data_2qccfC
  collection(collection: $collection) {
    numericTraits {
      key
      value {
        max
        min
      }
      ...NumericTraitFilter_data
    }
    stringTraits {
      key
      ...StringTraitFilter_data
    }
    id
  }
  ...PaymentFilter_data_2YoIWt
}

fragment AssetSearchList_data_3Aax2O on SearchResultType {
  asset {
    assetContract {
      address
      chain
      id
    }
    collection {
      isVerified
      id
    }
    relayId
    tokenId
    ...AssetSelectionItem_data
    ...asset_url
    id
  }
  assetBundle {
    relayId
    id
  }
  ...Asset_data_3Aax2O
}

fragment AssetSearch_data_2hBjZ1 on Query {
  ...CollectionHeadMetadata_data_2YoIWt
  ...AssetSearchFilter_data_3KTzFc
  ...SearchPills_data_2Kg4Sq
  search(after: $cursor, chains: $chains, categories: $categories, collections: $collections, first: $count, identity: $identity, numericTraits: $numericTraits, paymentAssets: $paymentAssets, priceFilter: $priceFilter, querystring: $query, resultType: $resultModel, sortAscending: $sortAscending, sortBy: $sortBy, stringTraits: $stringTraits, toggles: $toggles, creator: $creator, isPrivate: $isPrivate, safelistRequestStatuses: $safelistRequestStatuses) {
    edges {
      node {
        ...AssetSearchList_data_3Aax2O
        __typename
      }
      cursor
    }
    totalCount
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}

fragment AssetSelectionItem_data on AssetType {
  backgroundColor
  collection {
    displayData {
      cardDisplayStyle
    }
    imageUrl
    id
  }
  imageUrl
  name
  relayId
}

fragment Asset_data_3Aax2O on SearchResultType {
  asset {
    isDelisted
    ...AssetCardHeader_data_27d9G3
    ...AssetCardContent_asset
    ...AssetCardFooter_asset_fdERL
    ...AssetMedia_asset
    ...asset_url
    ...itemEvents_data
    id
  }
  assetBundle {
    ...bundle_url
    ...AssetCardContent_assetBundle
    ...AssetCardFooter_assetBundle
    id
  }
}

fragment CollectionFilter_data_2qccfC on Query {
  selectedCollections: collections(first: 25, collections: $collections, includeHidden: true) {
    edges {
      node {
        assetCount
        imageUrl
        name
        slug
        id
      }
    }
  }
  collections(assetOwner: $assetOwner, assetCreator: $creator, onlyPrivateAssets: $isPrivate, chains: $chains, first: 100, includeHidden: $includeHiddenCollections, parents: $categories, query: $collectionQuery, sortBy: $collectionSortBy) {
    edges {
      node {
        assetCount
        imageUrl
        name
        slug
        id
        __typename
      }
      cursor
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}

fragment CollectionHeadMetadata_data_2YoIWt on Query {
  collection(collection: $collection) {
    bannerImageUrl
    description
    imageUrl
    name
    id
  }
}

fragment CollectionModalContent_data on CollectionType {
  description
  imageUrl
  name
  slug
}

fragment NumericTraitFilter_data on NumericTraitTypePair {
  key
  value {
    max
    min
  }
}

fragment PaymentFilter_data_2YoIWt on Query {
  paymentAssets(first: 10) {
    edges {
      node {
        symbol
        relayId
        id
        __typename
      }
      cursor
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
  PaymentFilter_collection: collection(collection: $collection) {
    paymentAssets {
      symbol
      relayId
      id
    }
    id
  }
}

fragment Price_data on AssetType {
  decimals
  imageUrl
  symbol
  usdSpotPrice
  assetContract {
    blockExplorerLink
    chain
    id
  }
}

fragment SearchPills_data_2Kg4Sq on Query {
  selectedCollections: collections(first: 25, collections: $collections, includeHidden: true) {
    edges {
      node {
        imageUrl
        name
        slug
        ...CollectionModalContent_data
        id
      }
    }
  }
}

fragment StringTraitFilter_data on StringTraitType {
  counts {
    count
    value
  }
  key
}

fragment asset_edit_url on AssetType {
  assetContract {
    address
    chain
    id
  }
  tokenId
  collection {
    slug
    id
  }
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
  "variables": { "categories": null, "chains": null, "collection": null, "collectionQuery": null, "collectionSortBy": "ASSET_COUNT", "collections": [], "count": 100, "cursor": null, "identity": { "address": "0x4b5922abf25858d012d12bb1184e5d3d0b6d6be4" }, "includeHiddenCollections": false, "numericTraits": null, "paymentAssets": null, "priceFilter": null, "query": "", "resultModel": "ASSETS", "showContextMenu": true, "shouldShowQuantity": true, "sortAscending": null, "sortBy": "LAST_TRANSFER_DATE", "stringTraits": null, "toggles": null, "creator": null, "assetOwner": { "address": "0x4b5922abf25858d012d12bb1184e5d3d0b6d6be4" }, "isPrivate": false, "safelistRequestStatuses": null }
}







