CREATE TABLE public.list_listing (
	listing_id varchar NULL,
	title varchar NULL,
	description varchar NULL,
	author varchar NULL,
	id varchar NULL,
	signed varchar NULL,
	nonce numeric NULL,
	token_price numeric NULL,
	"timestamp" timestamp NULL DEFAULT now(),
	sold bool NULL DEFAULT false,
	cancelled bool NULL DEFAULT false,
	sold_time timestamp NULL,
	sold_offer varchar NULL,
	cancelled_time timestamp NULL,
	expiry_time timestamp NULL,
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

CREATE OR REPLACE VIEW public.listing_view
AS SELECT listing.title,
    listing.description,
    listing.author,
    listing."timestamp",
    listing.cancelled,
    listing.sold,
    listing.token_price,
    array_agg(DISTINCT a.nft_contract) AS contracts,
    sum(a.nft_amount) AS nft_quantity,
    count(a.*) AS nft_distincts,
        CASE
            WHEN count(a.*) = 0 THEN ARRAY[]::json[]
            ELSE array_agg(a.nfts)
        END AS nfts,
    listing.id
   FROM list_listing listing
     LEFT JOIN ( SELECT elem.listing_id,
            elem.nft_amount,
            nft.nft_contract,
            json_build_object('id', nft.nft_id, 'contract', nft.nft_contract, 'amount', elem.nft_amount, 'title', nft.nft_title, 'image', nft.nft_image, 'collection_name', nc.collection_name, 'collection_description', nc.collection_description, 'collection_image', nc.image_url, 'collection_type', nc.collection_type) AS nfts
           FROM list_listing_elem elem,
            nft20_nft nft,
            nft20_collection nc
          WHERE elem.nft_contract::text = nft.nft_contract::text AND elem.nft_id = nft.nft_id AND nft.nft_contract::text = nc.contract_address::text) a ON listing.id::text = a.listing_id::text
  GROUP BY listing.title, listing.description, listing.author, listing."timestamp", listing.cancelled, listing.nonce, listing.sold, listing.token_price, listing.id
  ORDER BY listing."timestamp" DESC;
