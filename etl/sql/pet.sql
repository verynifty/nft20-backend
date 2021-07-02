-- Drop table

-- DROP TABLE public.game_players;

CREATE TABLE pet (
	player_id numeric NULL,
	is_alive bool NULL,
	score numeric NULL,
	expected_reward numeric NULL,
	time_until_death numeric NULL,
	time_born timestamp NULL,
	"owner" varchar NULL,
	nft_contract varchar NULL,
	nft_id numeric NULL,
	tod timestamp NULL,
	CONSTRAINT unique_game_players UNIQUE (player_id)
);

-- Permissions

ALTER TABLE public.game_players OWNER TO doadmin;
GRANT ALL ON TABLE public.game_players TO doadmin;
GRANT SELECT ON TABLE public.game_players TO reader;
