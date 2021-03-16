CREATE OR REPLACE VIEW public.nft20_history
AS SELECT p.address,
    p.nft,
    p.nft_type,
    p.name,
    p.symbol,
    p.lp_eth_balance,
    p.lp_usd_balance,
    p.nft_eth_price,
    p.nft_usd_price,
    a.blocknumber,
    a.transactionhash,
    a."from",
    a."timestamp",
    a."to",
    a.pool,
    a."user",
    array_agg(a.id) AS ids,
    array_agg(a.amount) AS amounts,
    array_agg(n.nft_title) AS nft_name,
    array_agg(n.nft_image) AS nft_image,
    sum(abs(a.amount)) AS total_transfers,
    sum(a.amount) AS amount,
        CASE
            WHEN sum(a.amount) > 0::numeric THEN 'Deposit'::text
            WHEN sum(a.amount) < 0::numeric THEN 'Withdraw'::text
            WHEN sum(a.amount) = 0::numeric THEN 'Swap'::text
            ELSE NULL::text
        END AS type,
            CASE
            WHEN sum(a.amount) = 0::numeric THEN    sum(abs(a.amount) /2 * p.nft_eth_price )
            ELSE  sum(abs(a.amount)  * p.nft_eth_price )
        END AS volume_eth,
         CASE
            WHEN sum(a.amount) = 0::numeric THEN    sum(abs(a.amount) /2 * p.nft_usd_price )
            ELSE  sum(abs(a.amount)  * p.nft_usd_price )
        END AS volume_usd
   FROM nft20_action a,
    nft20_pair p,
    nft20_nft n
  WHERE a.pool::text = p.address::text AND n.nft_contract::text = p.nft::text AND n.nft_id = a.id
  GROUP BY a.blocknumber, a.transactionhash, a."from", a."timestamp", a."to", a.pool, p.nft, a."user", p.address, p.nft_type, p.lp_eth_balance, p.lp_usd_balance, p.nft_eth_price, p.nft_usd_price, p.name, p.symbol
  ORDER BY a.blocknumber DESC;