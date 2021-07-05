-- Drop table

-- DROP TABLE public.nft20_pair;

CREATE TABLE public.nft20_pair (
	address varchar NOT NULL,
	nft varchar NULL,
	nft_type numeric NULL,
	"name" varchar NULL,
	symbol varchar NULL,
	lp_eth_balance numeric NULL,
	lp_usd_balance numeric NULL,
	nft_usd_price numeric NULL,
	nft_eth_price numeric NULL,
	hidden bool NOT NULL DEFAULT false,
	logo_url varchar NOT NULL DEFAULT 'https://space-cdn-dokomaps.fra1.digitaloceanspaces.com/nft20/placeholder.png'::character varying,
	nft_value numeric NULL,
	network numeric NOT NULL DEFAULT 0,
	buy_price_eth numeric NULL,
	sell_price_eth numeric NULL,
	lp_version numeric NULL,
	lp_fee numeric NULL,
	index_order numeric NULL,
	CONSTRAINT nft20_pair_pk PRIMARY KEY (address),
	CONSTRAINT unique_pair UNIQUE (address)
);

-- Permissions

ALTER TABLE public.nft20_pair OWNER TO doadmin;
GRANT ALL ON TABLE public.nft20_pair TO doadmin;
