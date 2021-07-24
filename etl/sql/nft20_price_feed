CREATE TABLE public.nft20_price_feed (
	nft_address varchar NULL,
	eth_buy_price numeric NULL,
    usd_buy_price numeric NULL,
    eth_sell_price numeric NULL,
    usd_sell_price numeric NULL,
	"time" timestamp NULL
);

CREATE OR REPLACE VIEW nft20_price_feed_hour_view
as
SELECT  
    date_trunc('hour', "time" ) "time" ,
    npf .nft_address,
    (array_agg((eth_buy_price + eth_sell_price)/2 ORDER BY "time" ASC))[1] o_eth,
    MAX((eth_buy_price + eth_sell_price)/2) h_eth,
    MIN((eth_buy_price + eth_sell_price)/2) l_eth,
    (array_agg((eth_buy_price + eth_sell_price)/2 ORDER BY "time" DESC))[1] c_eth,
        (array_agg((usd_buy_price + usd_sell_price)/2 ORDER BY "time" ASC))[1] o_usd,
    MAX((usd_buy_price + usd_sell_price)/2) h_usd,
    MIN((usd_buy_price + usd_sell_price)/2) l_usd,
    (array_agg((usd_buy_price + usd_sell_price)/2 ORDER BY "time" DESC))[1] c_usd
FROM nft20_price_feed npf 
GROUP BY date_trunc('hour', "time" )  , nft_address
ORDER BY "time"  