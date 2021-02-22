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