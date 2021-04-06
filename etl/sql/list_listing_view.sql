create or REPLACE view listing_view as
select listing.title, listing .description , listing .author, listing ."timestamp", listing .cancelled, listing .nonce, listing .sold, listing .token_price , array_agg(distinct (a.nft_contract)) as contracts, SUM(a.nft_amount) as nft_quantity, count(a) as nft_distincts, CASE WHEN count(a) = 0 THEN ARRAY[]::json[] ELSE array_agg(a.nfts) END AS nfts
from list_listing listing LEFT OUTER JOIN
    (
    select elem.listing_id , elem.nft_amount, nft.nft_contract , json_build_object('id', nft.nft_id, 'contract', nft.nft_contract , 'amount', elem .nft_amount, 'title', nft.nft_title , 'image', nft.nft_image ) as nfts
    FROM list_listing_elem elem, nft20_nft nft
    where elem.nft_contract = nft.nft_contract and elem .nft_id = nft.nft_id 
  ) a on  listing.id = a.listing_id
group by listing.title, listing .description , listing .author, listing ."timestamp", listing .cancelled, listing .nonce, listing .sold, listing .token_price
order by listing."timestamp" DESC