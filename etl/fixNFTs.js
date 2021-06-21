require('dotenv').config()
let network = process.env.NETWORK == null ? 1 : parseInt(process.env.NETWORK)

const ethereum = new (require("./utils/ethereum"))(
    process.env.NFT20_MATIC
);

console.log(process.env.NFT20_DB_USER)

ERC721ABI = require("../contracts/ERC721.abi");

const { default: Axios } = require("axios");

storage = new (require("./utils/storage"))({
    user: process.env.NFT20_DB_USER,
    host: process.env.NFT20_DB_HOST,
    database: "verynifty",
    password: process.env.NFT20_DB_PASSWORD,
    port: 25061,
    ssl: true,
    ssl: { rejectUnauthorized: false },
});

const os = new (require("./utils/os_client"))(storage
);


let NFT20 = require("./utils/nft20")
const nft20 = new NFT20(ethereum, storage);

const sleep = (waitTimeInMs) =>
    new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

(async () => {
    await os.getNFTs("0xe89d4c65db4c859a83ba7f100154fa2d172b60b0");
    return;
    while (true) {
        let nfts = await storage.listMulti("nft20_nft", {
            nft_image: null
        })
        console.log(nfts.length)
        let i = 0
        for (const nft of nfts) {



            let q = {
                id: "itemQuery",
                query: `query itemQuery(
  $archetype: ArchetypeInputType!
  $chain: ChainScalar
) {
  archetype(archetype: $archetype) {
    asset {
      ...AssetCardHeader_data
      ...assetInputType
      assetContract {
        account {
          address
          chain {
            identifier
            id
          }
          id
        }
        blockExplorerLink
        id
      }
      assetOwners(first: 1) {
        edges {
          node {
            quantity
            owner {
              ...AccountLink_data
              id
            }
            id
          }
        }
      }
      creator {
        ...AccountLink_data
        id
      }
      animationUrl
      backgroundColor
      collection {
        description
        displayData {
          cardDisplayStyle
        }
        hidden
        imageUrl
        name
        slug
        ...CollectionLink_collection
        ...Boost_collection
        ...Property_collection
        ...NumericTrait_collection
        ...SocialBar_data
        ...verification_data
        id
      }
      decimals
      description
      imageUrl
      numVisitors
      isDelisted
      isListable
      name
      relayId
      tokenId
      hasUnlockableContent
      favoritesCount
      traits(first: 100) {
        edges {
          node {
            relayId
            displayType
            floatValue
            intValue
            traitType
            value
            ...Boost_trait
            ...Property_trait
            ...NumericTrait_trait
            ...Date_trait
            id
          }
        }
      }
      ...AssetMedia_asset
      ...EnsManualEntryModal_asset
      ...Toolbar_asset
      ...asset_url
      ...analyticsV2_item
      ...ChainInfo_data
      id
    }
    ownedQuantity(identity: {})
    ownershipCount
    quantity
    ...TradeStation_archetype_3wquQ2
    ...BidModalContent_archetype_3wquQ2
  }
  tradeSummary(archetype: $archetype) {
    bestAsk {
      closedAt
      orderType
      maker {
        ...wallet_accountKey
        id
      }
      relayId
      id
    }
    ...BidModalContent_trade
    ...TradeStation_data
  }
  account {
    user {
      isStaff
      id
    }
    id
  }
  assetEvents(archetype: $archetype, first: 1) {
    count
  }
}

fragment AccountLink_data on AccountType {
  address
  user {
    publicUsername
    id
  }
  ...ProfileImage_data
  ...wallet_accountKey
  ...accounts_url
}

fragment AskPrice_data on OrderV2Type {
  dutchAuctionFinalPrice
  openedAt
  priceFnEndedAt
  makerAssetBundle {
    assetQuantities(first: 30) {
      edges {
        node {
          ...quantity_data
          id
        }
      }
    }
    id
  }
  takerAssetBundle {
    assetQuantities(first: 1) {
      edges {
        node {
          ...AssetQuantity_data
          id
        }
      }
    }
    id
  }
}

fragment AssetCardHeader_data on AssetType {
  relayId
  favoritesCount
  isDelisted
  isFavorite
}

fragment AssetMedia_asset on AssetType {
  animationUrl
  backgroundColor
  collection {
    description
    displayData {
      cardDisplayStyle
    }
    imageUrl
    hidden
    name
    slug
    id
  }
  description
  name
  tokenId
  imageUrl
  isDelisted
}

fragment AssetQuantity_data on AssetQuantityType {
  asset {
    ...Price_data
    id
  }
  quantity
}

fragment BidModalContent_archetype_3wquQ2 on ArchetypeType {
  asset {
    assetContract {
      account {
        address
        chain {
          identifier
          id
        }
        id
      }
      id
    }
    decimals
    relayId
    collection {
      slug
      paymentAssets(chain: $chain) {
        relayId
        asset {
          assetContract {
            account {
              address
              chain {
                identifier
                id
              }
              id
            }
            id
          }
          decimals
          symbol
          usdSpotPrice
          relayId
          id
        }
        ...PaymentTokenInputV2_data
        id
      }
      ...verification_data
      id
    }
    id
  }
  quantity
  ownedQuantity(identity: {})
}

fragment BidModalContent_trade on TradeSummaryType {
  bestAsk {
    closedAt
    isFulfillable
    oldOrder
    orderType
    relayId
    makerAssetBundle {
      assetQuantities(first: 30) {
        edges {
          node {
            asset {
              collection {
                ...verification_data
                id
              }
              id
            }
            id
          }
        }
      }
      id
    }
    takerAssetBundle {
      assetQuantities(first: 1) {
        edges {
          node {
            quantity
            asset {
              decimals
              relayId
              id
            }
            id
          }
        }
      }
      id
    }
    id
  }
  bestBid {
    relayId
    makerAssetBundle {
      assetQuantities(first: 1) {
        edges {
          node {
            quantity
            asset {
              decimals
              id
            }
            ...AssetQuantity_data
            id
          }
        }
      }
      id
    }
    id
  }
}

fragment Boost_collection on CollectionType {
  numericTraits {
    key
    value {
      max
      min
    }
  }
  slug
}

fragment Boost_trait on TraitType {
  displayType
  floatValue
  intValue
  traitType
}

fragment ChainInfo_data on AssetType {
  assetContract {
    openseaVersion
    account {
      address
      chain {
        identifier
        id
      }
      id
    }
    blockExplorerLink
    id
  }
  isEditableByOwner {
    value
  }
  tokenId
  isFrozen
  frozenAt
  tokenMetadata
}

fragment CollectionLink_collection on CollectionType {
  slug
  name
  ...verification_data
}

fragment Date_trait on TraitType {
  traitType
  floatValue
  intValue
}

fragment EnsManualEntryModal_asset on AssetType {
  assetContract {
    account {
      address
      id
    }
    id
  }
  tokenId
}

fragment NumericTrait_collection on CollectionType {
  numericTraits {
    key
    value {
      max
      min
    }
  }
  slug
}

fragment NumericTrait_trait on TraitType {
  displayType
  floatValue
  intValue
  maxValue
  traitType
}

fragment PaymentAsset_data on PaymentAssetType {
  asset {
    assetContract {
      account {
        chain {
          identifier
          id
        }
        id
      }
      id
    }
    imageUrl
    symbol
    id
  }
}

fragment PaymentTokenInputV2_data on PaymentAssetType {
  relayId
  asset {
    decimals
    symbol
    usdSpotPrice
    id
  }
  ...PaymentAsset_data
}

fragment Price_data on AssetType {
  decimals
  imageUrl
  symbol
  usdSpotPrice
  assetContract {
    blockExplorerLink
    account {
      chain {
        identifier
        id
      }
      id
    }
    id
  }
}

fragment ProfileImage_data on AccountType {
  imageUrl
  address
  chain {
    identifier
    id
  }
}

fragment Property_collection on CollectionType {
  slug
  stats {
    totalSupply
    id
  }
}

fragment Property_trait on TraitType {
  displayType
  traitCount
  traitType
  value
}

fragment SocialBar_data on CollectionType {
  discordUrl
  externalUrl
  instagramUsername
  isEditable
  mediumUsername
  slug
  telegramUrl
  twitterUsername
}

fragment Toolbar_asset on AssetType {
  ...asset_url
  ...analyticsV2_item
  assetContract {
    account {
      address
      chain {
        identifier
        id
      }
      id
    }
    id
  }
  collection {
    externalUrl
    name
    slug
    id
  }
  externalLink
  name
  relayId
  tokenId
}

fragment TradeStation_archetype_3wquQ2 on ArchetypeType {
  ...BidModalContent_archetype_3wquQ2
}

fragment TradeStation_data on TradeSummaryType {
  bestAsk {
    isFulfillable
    closedAt
    dutchAuctionFinalPrice
    openedAt
    orderType
    priceFnEndedAt
    englishAuctionReservePrice
    relayId
    maker {
      ...wallet_accountKey
      id
    }
    makerAssetBundle {
      assetQuantities(first: 30) {
        edges {
          node {
            asset {
              assetContract {
                account {
                  chain {
                    identifier
                    id
                  }
                  id
                }
                id
              }
              collection {
                slug
                id
              }
              id
            }
            ...quantity_data
            id
          }
        }
      }
      id
    }
    taker {
      ...wallet_accountKey
      id
    }
    takerAssetBundle {
      assetQuantities(first: 1) {
        edges {
          node {
            quantity
            asset {
              symbol
              decimals
              relayId
              id
            }
            ...AssetQuantity_data
            id
          }
        }
      }
      id
    }
    ...AskPrice_data
    ...orderLink_data
    ...quantity_remaining
    id
  }
  bestBid {
    makerAssetBundle {
      assetQuantities(first: 1) {
        edges {
          node {
            quantity
            ...AssetQuantity_data
            id
          }
        }
      }
      id
    }
    id
  }
  ...BidModalContent_trade
}

fragment accounts_url on AccountType {
  address
  chain {
    identifier
    id
  }
  user {
    publicUsername
    id
  }
}

fragment analyticsV2_item on AssetType {
  assetContract {
    account {
      address
      chain {
        identifier
        id
      }
      id
    }
    id
  }
  tokenId
}

fragment assetInputType on AssetType {
  tokenId
  assetContract {
    account {
      address
      chain {
        identifier
        id
      }
      id
    }
    id
  }
}

fragment asset_url on AssetType {
  assetContract {
    account {
      address
      chain {
        identifier
        id
      }
      id
    }
    id
  }
  tokenId
}

fragment orderLink_data on OrderV2Type {
  makerAssetBundle {
    assetQuantities(first: 30) {
      edges {
        node {
          asset {
            externalLink
            collection {
              externalUrl
              id
            }
            id
          }
          id
        }
      }
    }
    id
  }
}

fragment quantity_data on AssetQuantityType {
  asset {
    decimals
    id
  }
  quantity
}

fragment quantity_remaining on OrderV2Type {
  quantity_remaining_makerAssetBundle: makerAssetBundle {
    assetQuantities(first: 1) {
      edges {
        node {
          asset {
            decimals
            id
          }
          quantity
          id
        }
      }
    }
    id
  }
  quantity_remaining_takerAssetBundle: takerAssetBundle {
    assetQuantities(first: 1) {
      edges {
        node {
          asset {
            decimals
            id
          }
          quantity
          id
        }
      }
    }
    id
  }
  remainingQuantity
  side
}

fragment verification_data on CollectionType {
  isMintable
  isSafelisted
  isVerified
}

fragment wallet_accountKey on AccountType {
  address
  chain {
    identifier
    id
  }
}`
                ,
                variables: {
                    "archetype": {
                        "assetContractAddress": nft.nft_contract,
                        "tokenId": nft.nft_id,
                        "chain": "MATIC"
                    },
                    "chain": "MATIC"
                }
            }





            let query = {
                id: "AssetSearchQuery",
                query:
                    `query AssetSearchQuery(
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

fragment AssetCardContent_asset_20mRwh on AssetType {
  relayId
  name
  ...AssetMedia_asset
  assetContract {
    account {
      address
      chain {
        identifier
        id
      }
      id
    }
    openseaVersion
    id
  }
  tokenId
  collection {
    slug
    id
  }
  isDelisted
  ...AssetContextMenu_data_3StDC7 @include(if: $showContextMenu)
}

fragment AssetCardFooter_assetBundle on AssetBundleType {
  name
  assetQuantities(first: 18) {
    edges {
      node {
        asset {
          collection {
            name
            relayId
            id
          }
          id
        }
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
    id
  }
  hasUnlockableContent
  isDelisted
  assetContract {
    account {
      address
      chain {
        identifier
        id
      }
      id
    }
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

fragment AssetCardHeader_data on AssetType {
  relayId
  favoritesCount
  isDelisted
  isFavorite
}

fragment AssetContextMenu_data_3StDC7 on AssetType {
  ...asset_edit_url
  name
  relayId
  isDelisted
  isEditable {
    value
    reason
  }
  isListable
  ownership(identity: $identity) {
    isPrivate
    quantity
  }
  creator {
    address
    id
  }
}

fragment AssetMedia_asset on AssetType {
  animationUrl
  backgroundColor
  collection {
    description
    displayData {
      cardDisplayStyle
    }
    imageUrl
    hidden
    name
    slug
    id
  }
  description
  name
  tokenId
  imageUrl
  isDelisted
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

}

fragment AssetSearchList_data_3Aax2O on SearchResultType {
  asset {
    assetContract {
      account {
        address
        chain {
          identifier
          id
        }
        id
      }
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
    assetContract {
      account {
        chain {
          identifier
          id
        }
        id
      }
      id
    }
    isDelisted
    ...AssetCardHeader_data
    ...AssetCardContent_asset_20mRwh
    ...AssetCardFooter_asset_fdERL
    ...AssetMedia_asset
    ...asset_url
    id
  }
  assetBundle {
    slug
    assetCount
    ...AssetCardContent_assetBundle
    ...AssetCardFooter_assetBundle
    id
  }
}

fragment CategoryFilter_data on Query {
  categories {
    imageUrl
    name
    slug
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
        asset {
          symbol
          id
        }
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
      asset {
        symbol
        id
      }
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
    account {
      chain {
        identifier
        id
      }
      id
    }
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
    account {
      address
      chain {
        identifier
        id
      }
      id
    }
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
    account {
      address
      chain {
        identifier
        id
      }
      id
    }
    id
  }
  tokenId
}
`,
                variables: {
                    categories: null,
                    chains: null,
                    collection: "beansbeansbeans",
                    collectionQuery: "0xjdjdjdj",
                    collectionSortBy: "ASSET_COUNT",
                    collections: [],
                    count: 32,
                    cursor: null,
                    identity: {
                        address: "0x4B5922ABf25858d012d12bb1184e5d3d0B6D6BE4", //this.$store.state.account,
                        chain: "MATIC",
                    },
                    includeHiddenCollections: false,
                    numericTraits: null,
                    paymentAssets: null,
                    priceFilter: null,
                    query: "",
                    resultModel: null,
                    showContextMenu: false,
                    shouldShowQuantity: true,
                    sortAscending: null,
                    sortBy: "LISTING_DATE",
                    stringTraits: null,
                    toggles: null,
                    creator: null,
                    assetOwner: {
                        address: "0x4B5922ABf25858d012d12bb1184e5d3d0B6D6BE4", //this.$store.state.account,
                        chain: "MATIC",
                    },
                    isPrivate: false,
                    safelistRequestStatuses: null,
                },
            };

            let r = await Axios.post("https://api.opensea.io/graphql/", query)
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
            return
            console.log(JSON.stringify(r.data.data, null, " "))

            continue;
            let n = r.data.data

            if (n != null) {
                n = n.archetype.asset;
                let data = {
                    nft_contract: nft.nft_contract,
                    nft_id: nft.nft_id,
                    nft_image: n.imageUrl,
                    nft_original_image: n.imageUrl,
                    nft_title: n.name,
                    nft_description: n.description,
                    nft_trait: n.traits
                };
                console.log(data.nft_trait)
                await Axios.post("https://api.nft20.io/nft/matic/new", {
                    nfts: [data],
                });
            }
            await sleep(2000)
            continue;

            /*  try {
                  let data = await Axios.get("https://api.covalenthq.com/v1/137/tokens/" + nft.nft_contract + "/nft_metadata/" + nft.nft_id + "/?key=ckey_b782b28d28c743ce8249ecef46f")
                  console.log(data.data.data.items[0])
  
              } catch (e) {
  
              } */

            console.log(i++)
            let ctx = new ethereum.w3.eth.Contract(
                ERC721ABI,
                nft.nft_contract
            );
            // continue;
            try {
                let u = await ctx.methods.tokenURI(nft.nft_id).call()
                if (u != null && u != "") {
                    if (u.startsWith("ipfs://")) {
                        u = "https://ipfs.io/ipfs/" + u.slice(7)
                    }
                    console.log(u)
                    let res = await Axios.get(u)
                    if (res.data.image.startsWith("ipfs://")) {
                        res.data.image = "https://ipfs.io/ipfs/" + res.data.image.slice(7)
                    }
                    let data = {
                        nft_contract: nft.nft_contract,
                        nft_id: nft.nft_id,
                        nft_image: res.data.image,
                        nft_original_image: res.data.image,
                        nft_title: res.data.name,
                        nft_description: res.data.description
                    };
                    console.log(data)
                    await Axios.post("https://api.nft20.io/nft/matic/new", {
                        nfts: [data],
                    });
                }
            } catch (error) {
                console.log("error")
            }

        }
        return


        // console.log(nfts)
    }
})();
