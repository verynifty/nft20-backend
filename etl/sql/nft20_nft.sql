-- Drop table

-- DROP TABLE public.nft20_nft;

CREATE TABLE public.nft20_nft (
	nft_contract varchar NULL,
	nft_id numeric NULL,
	nft_title varchar NULL,
	nft_description varchar NULL,
	nft_image varchar NULL,
	nft_original_image varchar NULL,
    nft_trait json NULL,
	CONSTRAINT unique_nft UNIQUE (nft_contract, nft_id)
);

CREATE TABLE nft20_collection (
	contract_address varchar NULL,
	image_url varchar null,
	collection_name varchar null,
	collection_description varchar null,
	external_url varchar null,
	collection_type NUMERIC null,
	CONSTRAINT unique_collection UNIQUE (contract_address)
);


CREATE OR REPLACE VIEW public.nft20_nfts_view
AS 
SELECT a.pool AS pool,
    n.nft_contract,
    n.nft_id,
    n.nft_image,
    n.nft_title,
    n.nft_description,
    availabe_quantity,
    n.nft_trait 
   FROM (select a.id, a.nft,  a.pool as pool, sum(a.amount) AS availabe_quantity FROM  nft20_action a group by a.id, a.pool, a.nft) as a
   join nft20_nft n on n.nft_contract::text = a.nft::text AND n.nft_id = a.id