-- Drop table

-- DROP TABLE public.game_players;


CREATE TABLE cudl_pet (
	pet_id numeric NULL,
	is_alive bool NULL,
	is_starving bool NULL,
	score numeric NULL,
	expected_reward numeric NULL,
	time_born timestamp NULL,
	"owner" varchar NULL,
	nft_contract varchar NULL,
	caretaker varchar NULL,
	nft_id numeric NULL,
	tod timestamp NULL,
	last_time_mined timestamp NULL,
	"name" varchar NULL,
	CONSTRAINT unique_cudl_pet UNIQUE (pet_id)
);

CREATE TABLE cudl_mined
(
    blocknumber numeric NULL,
    transactionhash varchar NULL,
    "from" varchar NULL,
    logindex numeric NULL,
    "timestamp" timestamp NULL,
    addonid numeric NULL,
    "to" varchar NULL,
    gasprice numeric NULL,
    pet numeric NULL,
    amount numeric NULL,
    "recipient" varchar NULL,
    CONSTRAINT unique_cudl_mined UNIQUE (transactionhash, logindex)
);

CREATE TABLE cudl_feed
(
    blocknumber numeric NULL,
    transactionhash varchar NULL,
    "from" varchar NULL,
    logindex numeric NULL,
    "timestamp" timestamp NULL,
    addonid numeric NULL,
    "to" varchar NULL,
    gasprice numeric NULL,
    pet numeric NULL,
    item numeric NULL,
    amount_paid numeric NULL,
    time_extension numeric NULL,
    "buyer" varchar NULL,
    CONSTRAINT unique_cudl_feed UNIQUE (transactionhash, logindex)
);

CREATE TABLE cudl_fatalize
(
    blocknumber numeric NULL,
    transactionhash varchar NULL,
    "from" varchar NULL,
    logindex numeric NULL,
    "timestamp" timestamp NULL,
    addonid numeric NULL,
    "to" varchar NULL,
    gasprice numeric NULL,
    victim numeric NULL,
    winner numeric NULL,
    badguy varchar NULL,
    CONSTRAINT unique_cudl_fatalize UNIQUE (transactionhash, logindex)
);

CREATE TABLE cudl_register
(
    blocknumber numeric NULL,
    transactionhash varchar NULL,
    "from" varchar NULL,
    logindex numeric NULL,
    "timestamp" timestamp NULL,
    addonid numeric NULL,
    "to" varchar NULL,
    gasprice numeric NULL,
    originnft varchar NULL,
    originid numeric NULL,
    pet_id numeric NULL,
    "owner" varchar NULL,
    CONSTRAINT unique_cudl_register UNIQUE (transactionhash, logindex)
);

CREATE TABLE cudl_bonk
(
    blocknumber numeric NULL,
    transactionhash varchar NULL,
    "from" varchar NULL,
    logindex numeric NULL,
    "timestamp" timestamp NULL,
    addonid numeric NULL,
    "to" varchar NULL,
    gasprice numeric NULL,
    attacker numeric NULL,
    victim numeric NULL,
    winner numeric NULL,
    reward numeric NULL,
    CONSTRAINT unique_cudl_bonk UNIQUE (transactionhash, logindex)
);

CREATE TABLE cudl_bazaar
(
    blocknumber numeric NULL,
    transactionhash varchar NULL,
    "from" varchar NULL,
    logindex numeric NULL,
    "timestamp" timestamp NULL,
    addonid numeric NULL,
    "to" varchar NULL,
    gasprice numeric NULL,
    pet_id numeric NULL,
    item NUMERIC NULL,
    CONSTRAINT unique_cudl_bazaar_item UNIQUE (transactionhash, logindex)
);



CREATE TABLE cudl_attack
(
    blocknumber numeric NULL,
    transactionhash varchar NULL,
    "from" varchar NULL,
    logindex numeric NULL,
    "timestamp" timestamp NULL,
    addonid numeric NULL,
    "to" varchar NULL,
    gasprice numeric NULL,
    attacker numeric NULL,
    victim numeric NULL,
    score numeric NULL,
    CONSTRAINT unique_cudl_attack UNIQUE (transactionhash, logindex)
);


CREATE OR REPLACE VIEW cudl_pet_view AS
select p.*, row_number () over (order by is_alive desc, score desc ) as ranking
from cudl_pet p

-- Permissions

ALTER TABLE public.game_players OWNER TO doadmin;
GRANT ALL ON TABLE public.game_players TO doadmin;
GRANT SELECT ON TABLE public.game_players TO reader;
