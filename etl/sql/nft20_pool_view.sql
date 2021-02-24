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
    sum(h.amount) AS nft_locked,
    sum(h.amount) * 100::numeric AS token_supply,
    sum(h.total_transfers) AS total_nft_transfers,
    count(DISTINCT h."user") AS pool_users
   FROM nft20_pair p,
    nft20_history h
  WHERE h.address::text = p.address::text
  GROUP BY p.address
  ORDER BY p.name;