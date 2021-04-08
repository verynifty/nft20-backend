CREATE TABLE list_listing
(
    listing_id varchar NULL,
    title varchar NULL,
    description varchar null,
    author varchar null,
    id varchar null,
    signed varchar null,
    nonce numeric null,
    token_price numeric null,
    timestamp timestamp default NOW(),
    sold boolean default FALSE ,
    cancelled boolean default FALSE,
    sold_time timestamp null,
    sold_offer varchar null,
    cancelled_time timestamp null,
    CONSTRAINT unique_listing UNIQUE (id)
);


CREATE TABLE list_listing_elem
(
    listing_id varchar null,
    nft_contract varchar null,
    nft_id numeric null,
    nft_amount numeric null,
    nonce numeric null,
    CONSTRAINT unique_listing_item UNIQUE (listing_id, nonce)
);

create or REPLACE view listing_view as
select listing.title, listing .description , listing .author, listing ."timestamp", listing .cancelled, listing .nonce, listing .sold, listing .token_price , array_agg(distinct (a.nft_contract)) as contracts, SUM(a.nft_amount) as nft_quantity, count(a) as nft_distincts, CASE WHEN count(a) = 0 THEN ARRAY[]::json[] ELSE array_agg(a.nfts) END AS nfts, listing .id
from list_listing listing LEFT OUTER JOIN
    (
    select elem.listing_id , elem.nft_amount, nft.nft_contract , json_build_object('id', nft.nft_id, 'contract', nft.nft_contract , 'amount', elem .nft_amount, 'title', nft.nft_title , 'image', nft.nft_image, 'collection_name', nc.collection_name , 'collection_description', nc.collection_description , 'collection_image', nc.image_url, 'collection_type', nc.collection_type ) as nfts
    FROM list_listing_elem elem, nft20_nft nft, nft20_collection nc
    where elem.nft_contract = nft.nft_contract and elem .nft_id = nft.nft_id and nft.nft_contract = nc.contract_address 
  ) a on  listing.id = a.listing_id
group by listing.title, listing .description , listing .author, listing ."timestamp", listing .cancelled, listing .nonce, listing .sold, listing .token_price, listing .id
order by listing."timestamp" DESC
