require('dotenv').config()

const ethereum = new (require("./utils/ethereum"))(
  process.env.NFT20_INFURA
);

console.log(process.env.NFT20_DB_USER)

let q = {
    id: "itemQuery",
    query: "query itemQuery(\n  $archetype: ArchetypeInputType!\n  $chain: ChainScalar\n) {\n  archetype(archetype: $archetype) {\n    asset {\n      ...AssetCardHeader_data\n      ...assetInputType\n      assetContract {\n        account {\n          address\n          chain {\n            identifier\n            id\n          }\n          id\n        }\n        blockExplorerLink\n        id\n      }\n      assetOwners(first: 1) {\n        edges {\n          node {\n            quantity\n            owner {\n              ...AccountLink_data\n              id\n            }\n            id\n          }\n        }\n      }\n      creator {\n        ...AccountLink_data\n        id\n      }\n      animationUrl\n      backgroundColor\n      collection {\n        description\n        displayData {\n          cardDisplayStyle\n        }\n        hidden\n        imageUrl\n        name\n        slug\n        ...CollectionLink_collection\n        ...Boost_collection\n        ...Property_collection\n        ...NumericTrait_collection\n        ...SocialBar_data\n        ...verification_data\n        id\n      }\n      decimals\n      description\n      imageUrl\n      numVisitors\n      isDelisted\n      isListable\n      name\n      relayId\n      tokenId\n      hasUnlockableContent\n      favoritesCount\n      traits(first: 100) {\n        edges {\n          node {\n            relayId\n            displayType\n            floatValue\n            intValue\n            traitType\n            value\n            ...Boost_trait\n            ...Property_trait\n            ...NumericTrait_trait\n            ...Date_trait\n            id\n          }\n        }\n      }\n      ...AssetMedia_asset\n      ...EnsManualEntryModal_asset\n      ...Toolbar_asset\n      ...asset_url\n      ...analyticsV2_item\n      ...ChainInfo_data\n      id\n    }\n    ownedQuantity(identity: {})\n    ownershipCount\n    quantity\n    ...TradeStation_archetype_3wquQ2\n    ...BidModalContent_archetype_3wquQ2\n  }\n  tradeSummary(archetype: $archetype) {\n    bestAsk {\n      closedAt\n      orderType\n      maker {\n        ...wallet_accountKey\n        id\n      }\n      relayId\n      id\n    }\n    ...BidModalContent_trade\n    ...TradeStation_data\n  }\n  account {\n    user {\n      isStaff\n      id\n    }\n    id\n  }\n  assetEvents(archetype: $archetype, first: 1) {\n    count\n  }\n}\n\nfragment AccountLink_data on AccountType {\n  address\n  user {\n    publicUsername\n    id\n  }\n  ...ProfileImage_data\n  ...wallet_accountKey\n  ...accounts_url\n}\n\nfragment AskPrice_data on OrderV2Type {\n  dutchAuctionFinalPrice\n  openedAt\n  priceFnEndedAt\n  makerAssetBundle {\n    assetQuantities(first: 30) {\n      edges {\n        node {\n          ...quantity_data\n          id\n        }\n      }\n    }\n    id\n  }\n  takerAssetBundle {\n    assetQuantities(first: 1) {\n      edges {\n        node {\n          ...AssetQuantity_data\n          id\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment AssetCardHeader_data on AssetType {\n  relayId\n  favoritesCount\n  isDelisted\n  isFavorite\n}\n\nfragment AssetMedia_asset on AssetType {\n  animationUrl\n  backgroundColor\n  collection {\n    description\n    displayData {\n      cardDisplayStyle\n    }\n    imageUrl\n    hidden\n    name\n    slug\n    id\n  }\n  description\n  name\n  tokenId\n  imageUrl\n  isDelisted\n}\n\nfragment AssetQuantity_data on AssetQuantityType {\n  asset {\n    ...Price_data\n    id\n  }\n  quantity\n}\n\nfragment BidModalContent_archetype_3wquQ2 on ArchetypeType {\n  asset {\n    assetContract {\n      account {\n        address\n        chain {\n          identifier\n          id\n        }\n        id\n      }\n      id\n    }\n    decimals\n    relayId\n    collection {\n      slug\n      paymentAssets(chain: $chain) {\n        relayId\n        asset {\n          assetContract {\n            account {\n              address\n              chain {\n                identifier\n                id\n              }\n              id\n            }\n            id\n          }\n          decimals\n          symbol\n          usdSpotPrice\n          relayId\n          id\n        }\n        ...PaymentTokenInputV2_data\n        id\n      }\n      ...verification_data\n      id\n    }\n    id\n  }\n  quantity\n  ownedQuantity(identity: {})\n}\n\nfragment BidModalContent_trade on TradeSummaryType {\n  bestAsk {\n    closedAt\n    isFulfillable\n    oldOrder\n    orderType\n    relayId\n    makerAssetBundle {\n      assetQuantities(first: 30) {\n        edges {\n          node {\n            asset {\n              collection {\n                ...verification_data\n                id\n              }\n              id\n            }\n            id\n          }\n        }\n      }\n      id\n    }\n    takerAssetBundle {\n      assetQuantities(first: 1) {\n        edges {\n          node {\n            quantity\n            asset {\n              decimals\n              relayId\n              id\n            }\n            id\n          }\n        }\n      }\n      id\n    }\n    id\n  }\n  bestBid {\n    relayId\n    makerAssetBundle {\n      assetQuantities(first: 1) {\n        edges {\n          node {\n            quantity\n            asset {\n              decimals\n              id\n            }\n            ...AssetQuantity_data\n            id\n          }\n        }\n      }\n      id\n    }\n    id\n  }\n}\n\nfragment Boost_collection on CollectionType {\n  numericTraits {\n    key\n    value {\n      max\n      min\n    }\n  }\n  slug\n}\n\nfragment Boost_trait on TraitType {\n  displayType\n  floatValue\n  intValue\n  traitType\n}\n\nfragment ChainInfo_data on AssetType {\n  assetContract {\n    openseaVersion\n    account {\n      address\n      chain {\n        identifier\n        id\n      }\n      id\n    }\n    blockExplorerLink\n    id\n  }\n  isEditableByOwner {\n    value\n  }\n  tokenId\n  isFrozen\n  frozenAt\n  tokenMetadata\n}\n\nfragment CollectionLink_collection on CollectionType {\n  slug\n  name\n  ...verification_data\n}\n\nfragment Date_trait on TraitType {\n  traitType\n  floatValue\n  intValue\n}\n\nfragment EnsManualEntryModal_asset on AssetType {\n  assetContract {\n    account {\n      address\n      id\n    }\n    id\n  }\n  tokenId\n}\n\nfragment NumericTrait_collection on CollectionType {\n  numericTraits {\n    key\n    value {\n      max\n      min\n    }\n  }\n  slug\n}\n\nfragment NumericTrait_trait on TraitType {\n  displayType\n  floatValue\n  intValue\n  maxValue\n  traitType\n}\n\nfragment PaymentAsset_data on PaymentAssetType {\n  asset {\n    assetContract {\n      account {\n        chain {\n          identifier\n          id\n        }\n        id\n      }\n      id\n    }\n    imageUrl\n    symbol\n    id\n  }\n}\n\nfragment PaymentTokenInputV2_data on PaymentAssetType {\n  relayId\n  asset {\n    decimals\n    symbol\n    usdSpotPrice\n    id\n  }\n  ...PaymentAsset_data\n}\n\nfragment Price_data on AssetType {\n  decimals\n  imageUrl\n  symbol\n  usdSpotPrice\n  assetContract {\n    blockExplorerLink\n    account {\n      chain {\n        identifier\n        id\n      }\n      id\n    }\n    id\n  }\n}\n\nfragment ProfileImage_data on AccountType {\n  imageUrl\n  address\n  chain {\n    identifier\n    id\n  }\n}\n\nfragment Property_collection on CollectionType {\n  slug\n  stats {\n    totalSupply\n    id\n  }\n}\n\nfragment Property_trait on TraitType {\n  displayType\n  traitCount\n  traitType\n  value\n}\n\nfragment SocialBar_data on CollectionType {\n  discordUrl\n  externalUrl\n  instagramUsername\n  isEditable\n  mediumUsername\n  slug\n  telegramUrl\n  twitterUsername\n}\n\nfragment Toolbar_asset on AssetType {\n  ...asset_url\n  ...analyticsV2_item\n  assetContract {\n    account {\n      address\n      chain {\n        identifier\n        id\n      }\n      id\n    }\n    id\n  }\n  collection {\n    externalUrl\n    name\n    slug\n    id\n  }\n  externalLink\n  name\n  relayId\n  tokenId\n}\n\nfragment TradeStation_archetype_3wquQ2 on ArchetypeType {\n  ...BidModalContent_archetype_3wquQ2\n}\n\nfragment TradeStation_data on TradeSummaryType {\n  bestAsk {\n    isFulfillable\n    closedAt\n    dutchAuctionFinalPrice\n    openedAt\n    orderType\n    priceFnEndedAt\n    englishAuctionReservePrice\n    relayId\n    maker {\n      ...wallet_accountKey\n      id\n    }\n    makerAssetBundle {\n      assetQuantities(first: 30) {\n        edges {\n          node {\n            asset {\n              assetContract {\n                account {\n                  chain {\n                    identifier\n                    id\n                  }\n                  id\n                }\n                id\n              }\n              collection {\n                slug\n                id\n              }\n              id\n            }\n            ...quantity_data\n            id\n          }\n        }\n      }\n      id\n    }\n    taker {\n      ...wallet_accountKey\n      id\n    }\n    takerAssetBundle {\n      assetQuantities(first: 1) {\n        edges {\n          node {\n            quantity\n            asset {\n              symbol\n              decimals\n              relayId\n              id\n            }\n            ...AssetQuantity_data\n            id\n          }\n        }\n      }\n      id\n    }\n    ...AskPrice_data\n    ...orderLink_data\n    ...quantity_remaining\n    id\n  }\n  bestBid {\n    makerAssetBundle {\n      assetQuantities(first: 1) {\n        edges {\n          node {\n            quantity\n            ...AssetQuantity_data\n            id\n          }\n        }\n      }\n      id\n    }\n    id\n  }\n  ...BidModalContent_trade\n}\n\nfragment accounts_url on AccountType {\n  address\n  chain {\n    identifier\n    id\n  }\n  user {\n    publicUsername\n    id\n  }\n}\n\nfragment analyticsV2_item on AssetType {\n  assetContract {\n    account {\n      address\n      chain {\n        identifier\n        id\n      }\n      id\n    }\n    id\n  }\n  tokenId\n}\n\nfragment assetInputType on AssetType {\n  tokenId\n  assetContract {\n    account {\n      address\n      chain {\n        identifier\n        id\n      }\n      id\n    }\n    id\n  }\n}\n\nfragment asset_url on AssetType {\n  assetContract {\n    account {\n      address\n      chain {\n        identifier\n        id\n      }\n      id\n    }\n    id\n  }\n  tokenId\n}\n\nfragment orderLink_data on OrderV2Type {\n  makerAssetBundle {\n    assetQuantities(first: 30) {\n      edges {\n        node {\n          asset {\n            externalLink\n            collection {\n              externalUrl\n              id\n            }\n            id\n          }\n          id\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment quantity_data on AssetQuantityType {\n  asset {\n    decimals\n    id\n  }\n  quantity\n}\n\nfragment quantity_remaining on OrderV2Type {\n  quantity_remaining_makerAssetBundle: makerAssetBundle {\n    assetQuantities(first: 1) {\n      edges {\n        node {\n          asset {\n            decimals\n            id\n          }\n          quantity\n          id\n        }\n      }\n    }\n    id\n  }\n  quantity_remaining_takerAssetBundle: takerAssetBundle {\n    assetQuantities(first: 1) {\n      edges {\n        node {\n          asset {\n            decimals\n            id\n          }\n          quantity\n          id\n        }\n      }\n    }\n    id\n  }\n  remainingQuantity\n  side\n}\n\nfragment verification_data on CollectionType {\n  isMintable\n  isSafelisted\n  isVerified\n}\n\nfragment wallet_accountKey on AccountType {\n  address\n  chain {\n    identifier\n    id\n  }\n}\n",
    variables:{
        "archetype": {
            "assetContractAddress": "0x493e860a3fae21ce426a7fa6c70483772e5b19cc",
            "tokenId": "22",
            "chain": "MATIC"
        },
        "chain": "MATIC"
    }
}

storage = new (require("./utils/storage"))({
  user: process.env.NFT20_DB_USER,
  host: process.env.NFT20_DB_HOST,
  database: "verynifty",
  password: process.env.NFT20_DB_PASSWORD,
  port: 25061,
  ssl: true,
  ssl: { rejectUnauthorized: false },
});
let NFT20 = require("./utils/nft20")
const nft20 = new NFT20(ethereum, storage);
const { default: Axios } = require("axios");

const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

(async () => {
    let r = await Axios.post("https://api.opensea.io/graphql/",q)
    console.log(r.data.data)
})();