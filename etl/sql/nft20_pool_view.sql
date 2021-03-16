CREATE OR REPLACE VIEW  public.nft20_pool_view AS 
SELECT p.address,
    p.nft,
    p.nft_type,
    p.name,
    p.symbol,
    p.lp_eth_balance,
    p.lp_usd_balance,
    p.nft_usd_price,
    p.nft_eth_price,
    COALESCE(sum(h.amount), 0::numeric) AS nft_locked,
    COALESCE(sum(h.amount) * 100::numeric, 0::numeric) AS token_supply,
    COALESCE(sum(h.total_transfers), 0::numeric) AS total_nft_transfers,
    COALESCE(count(DISTINCT h."user"), 0::bigint) AS pool_users,
    p.logo_url,
    COALESCE(count(DISTINCT h."user") FILTER (WHERE h."timestamp" > (CURRENT_DATE - '1 day'::interval)), 0::bigint) AS users_today,
    COALESCE(count(DISTINCT h."user") FILTER (WHERE h."timestamp" > (CURRENT_DATE - '7 day'::interval)), 0::bigint) AS users_weekly,
    p.nft_value,
     COALESCE(sum(h.volume_usd)  FILTER (WHERE h."timestamp" > (CURRENT_DATE - '1 day'::interval)), 0::bigint) AS volume_today_usd,
    COALESCE(sum(h.volume_usd) FILTER (WHERE h."timestamp" > (CURRENT_DATE - '7 day'::interval)), 0::bigint) AS volume_weekly_usd,
    COALESCE(sum(h.volume_eth)  FILTER (WHERE h."timestamp" > (CURRENT_DATE - '1 day'::interval)), 0::bigint) AS volume_today_eth,
    COALESCE(sum(h.volume_eth) FILTER (WHERE h."timestamp" > (CURRENT_DATE - '7 day'::interval)), 0::bigint) AS volume_weekly_eth,
    COALESCE(sum(h.volume_usd), 0)  as volume_usd,
        COALESCE(sum(h.volume_eth), 0)  as volume_eth
   FROM nft20_pair p
     LEFT JOIN nft20_history h ON h.address::text = p.address::text
  WHERE p.hidden = false
  GROUP BY p.address
  ORDER BY p.name;