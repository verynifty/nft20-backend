CREATE TABLE list_listing (
	title varchar NULL,
	description varchar null,
	author varchar null,
	id varchar null,
	signed varchar null,
	nonce numeric null,
	token_price numeric null,
	timestamp timestamp null,
	sold boolean default false ,
	cancelled boolean default false,
	CONSTRAINT unique_listing UNIQUE (id)
);

CREATE TABLE list_listing_elem (
	listing_id varchar null,
	nft_contract varchar null,
	nft_id numeric null,
	nft_amount numeric null,
	nonce numeric null,
	CONSTRAINT unique_listing_item UNIQUE (listing_id, nonce)
);