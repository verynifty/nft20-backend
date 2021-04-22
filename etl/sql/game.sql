CREATE TABLE game_players
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

CREATE TABLE game_kill
(
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

CREATE TABLE game_attack
(
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

CREATE TABLE game_buy
(
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

CREATE TABLE game_claim
(
    blocknumber numeric NULL,
    transactionhash varchar NULL,
    "from" varchar NULL,
    logindex numeric NULL,
    "timestamp" timestamp NULL,
    "to" varchar NULL,
    amount numeric NULL,
    "who" varchar NULL,
    CONSTRAINT unique_game_claim UNIQUE (transactionhash, logindex)
);

create or REPLACE view game_players_view  as
select gp.*, n.nft_image , n.nft_original_image , n.nft_title , n.nft_trait , c.collection_name , c.collection_description , c.collection_type , c.external_url as collection_url , c.image_url as collection_image
from game_players gp LEFT join nft20_nft n on gp.nft_contract = n.nft_contract and gp.nft_id = n.nft_id left join nft20_collection c on gp.nft_contract = c.contract_address 
