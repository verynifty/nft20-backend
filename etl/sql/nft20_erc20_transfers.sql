
CREATE TABLE public.nft20_erc20_transfers (
	blocknumber numeric NULL,
	transactionhash varchar NULL,
	"from" varchar NULL,
	logindex numeric NULL,
	"timestamp" timestamp NULL,
	"to" varchar NULL,
	pool varchar NULL,
	nft varchar NULL,
	transfer_from varchar NULL,
	transfer_to varchar NULL,
    transfer_amount numeric null,
	CONSTRAINT unique_erc20_transfer UNIQUE (transactionhash, logindex)
);