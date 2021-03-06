CREATE OR REPLACE VIEW public.nft20_pool_view
AS SELECT p.address,
    p.nft,
    p.nft_type,
    p.name,
    p.symbol,
    p.lp_eth_balance,
    p.lp_usd_balance,
    p.nft_usd_price,
    p.nft_eth_price,
     COALESCE(sum(h.amount), 0) AS nft_locked,
     COALESCE(sum(h.amount) * 100::numeric, 0) AS token_supply,
     COALESCE(sum(h.total_transfers), 0) AS total_nft_transfers,
     COALESCE(count(DISTINCT h."user"), 0) AS pool_users,
    p.logo_url,
    COALESCE(count(DISTINCT h."user") FILTER (WHERE h."timestamp" > (CURRENT_DATE - '1 day'::interval)), 0::bigint) AS users_today,
    COALESCE(count(DISTINCT h."user") FILTER (WHERE h."timestamp" > (CURRENT_DATE - '1 day'::interval)), 0::bigint) AS users_weekly
   FROM nft20_pair p
     LEFT JOIN nft20_history h ON h.address::text = p.address::text
  WHERE p.hidden = false
  GROUP BY p.address
  ORDER BY p.name;