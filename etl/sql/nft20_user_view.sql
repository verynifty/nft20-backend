
CREATE MATERIALIZED VIEW public.nft20_user_view
AS SELECT h."user" AS address,
    u.name,
    COALESCE(sum(h.total_transfers), 0::numeric) AS nft_traded,
    COALESCE(count(DISTINCT h.transactionhash), 0::bigint) AS transactions,
    COALESCE(count(DISTINCT h.nft), 0::bigint) AS pools_traded,
    COALESCE(sum(receive.amount / '1000000000000000000'::numeric), 0::numeric) AS total_muse_received,
    COALESCE(count(DISTINCT v.id), 0::bigint) AS vnfts,
    MIN(v.image_url ) as avatar
   FROM nft20_history h
     LEFT JOIN nft20_user u ON h."user"::text = u.address::text
     LEFT JOIN muse_transfers receive ON h."user"::text = concat('0x', receive.receiver)
     LEFT JOIN vnft v ON h."user"::text = concat('0x', v.owner) AND NOT v.isdead
  GROUP BY h."user", u.name

-- View indexes:
CREATE UNIQUE INDEX nft20_user_view_address ON public.nft20_user_view USING btree (address);

