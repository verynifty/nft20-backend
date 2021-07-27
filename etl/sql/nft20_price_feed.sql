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

CREATE OR REPLACE VIEW nft20_price_feed_day_view
as
SELECT  
    date_trunc('day', "time" ) "time" ,
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
GROUP BY date_trunc('day', "time" )  , nft_address
ORDER BY "time"  

 
 SELECT w.nft_address,
    (array_agg(w.c_usd ORDER BY w."time" DESC))[1] AS price_now_usd,
    (array_agg(w.o_usd ORDER BY w."time"))[1] AS price_one_week_ago_usd,
    (array_agg(d.o_usd ORDER BY d."time"))[1] AS price_one_day_ago_usd,
    (array_agg(w.c_eth ORDER BY w."time" DESC))[1] AS price_now_eth,
    (array_agg(w.o_eth ORDER BY w."time"))[1] AS price_one_week_ago_eth,
    (array_agg(d.o_eth ORDER BY d."time"))[1] AS price_one_day_ago_eth,
    min(d.l_eth) AS price_low_day_eth,
    max(d.h_eth) AS price_high_day_eth,
    min(w.l_eth) AS price_low_week_eth,
    max(w.h_eth) AS price_high_week_eth,
    min(d.l_usd) AS price_low_day_usd,
    max(d.h_usd) AS price_high_day_usd,
    min(w.l_usd) AS price_low_week_usd,
    max(w.h_usd) AS price_high_week_usd,
    array_agg(w.c_eth ORDER BY w."time" ASC) AS trendline_eth,
    array_agg(w.c_usd ORDER BY w."time" ASC) AS trendline_usd
   FROM nft20_price_feed_day_view w,
    nft20_price_feed_day_view d
  WHERE w."time" >= (now() - '7 days'::interval) AND d."time" >= (now() - '1 day'::interval) AND w.nft_address::text = d.nft_address::text
  GROUP BY w.nft_address

-- View indexes:
CREATE UNIQUE INDEX nft20_price_summary_view_nft_address_idx ON public.nft20_price_summary_view USING btree (nft_address);
