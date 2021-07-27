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

create  MATERIALIZED view nft20_price_summary_view as 
select 
w.nft_address,
  (array_agg(w.c_usd ORDER BY w."time" DESC))[1] as  price_now_usd,
   (array_agg(w.o_usd ORDER BY w."time" ASC))[1] as price_one_week_ago_usd,
      (array_agg(d.o_usd  ORDER BY d."time" asc  )   )[1]   as price_one_day_ago_usd,
        (array_agg(w.c_eth ORDER BY w."time" DESC))[1] as  price_now_eth,
   (array_agg(w.o_eth ORDER BY w."time" ASC))[1] as price_one_week_ago_eth,
      (array_agg(d.o_eth  ORDER BY d."time" asc  )   )[1]   as price_one_day_ago_eth,
      min(d.l_eth ) as price_low_day_eth,
            max(d.h_eth ) as price_high_day_eth,
      min(w.l_eth ) as price_low_week_eth,
            max(w.h_eth ) as price_high_week_eth,
                  min(d.l_usd ) as price_low_day_usd,
            max(d.h_usd ) as price_high_day_usd,
      min(w.l_usd ) as price_low_week_usd,
            max(w.h_usd) as price_high_week_usd,
            array_agg(w.c_eth ) as trendline_eth,
            array_agg(w.c_usd ) as trendline_usd
   from nft20_price_feed_day_view w, nft20_price_feed_day_view d
      where w."time" >= NOW() - interval '1 week' and  d."time" >= NOW() - interval '1 day' and w.nft_address =d.nft_address 
      group by w.nft_address 
      
 CREATE UNIQUE INDEX nft20_price_summary_view_nft_address_idx ON public.nft20_price_summary_view USING btree (nft_address);
