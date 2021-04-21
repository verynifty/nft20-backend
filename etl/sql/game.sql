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