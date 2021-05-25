-- Drop table

-- DROP TABLE public.nft20_collection;

CREATE TABLE public.nft20_collection (
	contract_address varchar NULL,
	image_url varchar NULL,
	collection_name varchar NULL,
	collection_description varchar NULL,
	external_url varchar NULL,
	collection_type numeric NULL,
	banner_url varchar NULL,
	featured_image_url varchar NULL,
	twitter_username varchar NULL,
	telegram_url varchar NULL,
	number_of_owners numeric NULL,
	collection_total_assets numeric NULL,
	CONSTRAINT unique_collection UNIQUE (contract_address)
);

-- Permissions

ALTER TABLE public.nft20_collection OWNER TO doadmin;
GRANT ALL ON TABLE public.nft20_collection TO doadmin;
GRANT SELECT ON TABLE public.nft20_collection TO reader;
