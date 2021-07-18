-- Drop table

-- DROP TABLE public.game_players;

CREATE TABLE cudl_pet (
	pet_id numeric NULL,
	is_alive bool NULL,
    is_starving bool NULL,
	score numeric NULL,
	expected_reward numeric NULL,
	time_until_death numeric NULL,
	time_born timestamp NULL,
	"owner" varchar NULL,
	nft_contract varchar NULL,
	caretaker varchar NULL,
	nft_id numeric NULL,
	tod timestamp NULL,
	CONSTRAINT unique_game_players UNIQUE (player_id)
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
	victim numeric NULL,
	"owner" varchar NULL,
    CONSTRAINT unique_cudl_register UNIQUE (transactionhash, logindex)
);

-- Permissions

ALTER TABLE public.game_players OWNER TO doadmin;
GRANT ALL ON TABLE public.game_players TO doadmin;
GRANT SELECT ON TABLE public.game_players TO reader;
