module.exports = {
    id: "rankingsQuery",
    query = `query rankingsQuery(
  $chain: [ChainScalar!]
  $count: Int!
  $cursor: String
  $sortBy: CollectionSort
  $parents: [CollectionSlug!]
  $createdAfter: DateTime
) {
  ...rankings_collections
}

fragment rankings_collections on Query {
  collections(after: $cursor, chains: $chain, first: $count, sortBy: $sortBy, parents: $parents, createdAfter: $createdAfter, sortAscending: false, includeHidden: true) {
    edges {
      node {
        createdDate
        imageUrl
        name
        slug
        stats {
          averagePrice
          marketCap
          numOwners
          totalSupply
          sevenDayChange
          sevenDayVolume
          sevenDayAveragePrice
          oneDayChange
          oneDayVolume
          oneDayAveragePrice
          thirtyDayChange
          thirtyDayVolume
          thirtyDayAveragePrice
          totalVolume
          id
        }
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
}`,
    variables: {
        "chain": [
            "ETHEREUM"
        ],
        "count": 100,
        "cursor": null,
        "sortBy": "SEVEN_DAY_VOLUME",
        "parents": null,
        "createdAfter": null
    }
}
