-- DROP TABLE public.nft20_action;

CREATE TABLE public.nft20_action (
	blocknumber numeric NULL,
	transactionhash varchar NULL,
	"from" varchar NULL,
	logindex numeric NULL,
	"timestamp" timestamp NULL,
	"to" varchar NULL,
	pool varchar NULL,
	nft varchar NULL,
	id numeric NULL,
	amount numeric NULL,
	"user" varchar NULL,
	network numeric NOT NULL DEFAULT 0,
	CONSTRAINT unique_action UNIQUE (transactionhash, logindex, pool, id)
);
