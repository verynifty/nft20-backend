CREATE TABLE public.nft20_auctions
(
    auction_id numeric NULL,
    "seller" varchar NULL,
    "pair" varchar NULL,
    tokenid numeric NULL,
    "starting_price" numeric NULL,
    "ending_price" numeric NULL,
    "starting_time" timestamp NULL,
    "ending_time" timestamp NULL,
    "duration" numeric NULL,
    "ended" boolean null,
    CONSTRAINT unique_auction_id UNIQUE (auction_id)
);