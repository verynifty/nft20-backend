CREATE TABLE  game_players
 (
	player_id numeric NULL,
	is_alive boolean NULL,
	score numeric NULL,
	expected_reward numeric null,
	time_until_death numeric null,
	time_born timestamp null,
	"owner" varchar null,
	nft_contract varchar null,
	nft_id numeric null,
	tod "timestamp" null,
	CONSTRAINT unique_game_players UNIQUE (player_id)
);

CREATE TABLE game_kill (
	victim numeric NULL,
	"killer" varchar NULL,
	blocknumber numeric NULL,
	transactionhash varchar NULL,
	"from" varchar NULL,
	logindex numeric NULL,
	"timestamp" timestamp NULL,
	addonid numeric NULL,
	"to" varchar NULL,
	CONSTRAINT unique_game_kill UNIQUE (transactionhash, logindex)
);

CREATE TABLE game_attack (
	victim numeric NULL,
	attack numeric NULL,
	"attacker" varchar NULL,
	blocknumber numeric NULL,
	transactionhash varchar NULL,
	"from" varchar NULL,
	logindex numeric NULL,
	"timestamp" timestamp NULL,
	addonid numeric NULL,
	"to" varchar NULL,
	CONSTRAINT unique_game_attack UNIQUE (transactionhash, logindex)
);

CREATE TABLE game_buy (
	player numeric NULL,
	amount numeric NULL,
	blocknumber numeric NULL,
	transactionhash varchar NULL,
	"from" varchar NULL,
	logindex numeric NULL,
	"timestamp" timestamp NULL,
	addonid numeric NULL,
	"to" varchar NULL,
	CONSTRAINT unique_game_buy UNIQUE (transactionhash, logindex)
);