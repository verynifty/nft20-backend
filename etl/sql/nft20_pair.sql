-- DROP TABLE public.nft20_pair;

CREATE TABLE public.nft20_pair (
	address varchar NULL,
	nft varchar NULL,
	nft_type numeric NULL,
	"name" varchar NULL,
	symbol varchar NULL,
	lp_eth_balance numeric NULL,
	lp_usd_balance numeric NULL,
	nft_usd_price numeric NULL,
	nft_eth_price numeric NULL,
	CONSTRAINT unique_pair UNIQUE (address)
);