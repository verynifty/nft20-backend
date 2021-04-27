CREATE MATERIALIZED VIEW public.nft20_user_view
AS SELECT h."user" AS address,
    u.name,
    COALESCE(sum(h.total_transfers), 0::numeric) AS nft_traded,
    COALESCE(count(DISTINCT h.transactionhash), 0::bigint) AS transactions,
    COALESCE(count(DISTINCT h.nft), 0::bigint) AS pools_traded,
    COALESCE(sum(receive.amount / '1000000000000000000'::numeric), 0::numeric) AS total_muse_received,
    COALESCE(count(DISTINCT v.id), 0::bigint) AS vnfts,
    min(v.image_url::text) AS avatar
   FROM nft20_history h
     LEFT JOIN nft20_user u ON h."user"::text = u.address::text
     LEFT JOIN muse_transfers receive ON h."user"::text = concat('0x', receive.receiver)
     LEFT JOIN vnft v ON h."user"::text = concat('0x', v.owner) AND NOT v.isdead
  GROUP BY h."user", u.name
WITH DATA;

-- View indexes:
CREATE UNIQUE INDEX nft20_user_view_address ON public.nft20_user_view USING btree (address);


-- Permissions

ALTER TABLE public.nft20_user_view OWNER TO doadmin;
GRANT ALL ON TABLE public.nft20_user_view TO doadmin;
GRANT SELECT ON TABLE public.nft20_user_view TO reader;


CREATE OR REPLACE VIEW public.nft20_score
AS SELECT nft20_user_view.address,
    nft20_user_view.name,
    nft20_user_view.nft_traded,
    nft20_user_view.transactions,
    nft20_user_view.pools_traded,
    nft20_user_view.total_muse_received,
    nft20_user_view.vnfts,
    nft20_user_view.avatar,
        CASE
            WHEN nft20_user_view.total_muse_received > 0::numeric THEN 1
            ELSE 0
        END + nft20_user_view.vnfts +
        CASE
            WHEN nft20_user_view.transactions >= 4 THEN 4
            ELSE 0
        END +
        CASE
            WHEN nft20_user_view.transactions > 0 THEN 1
            ELSE 0
        END AS score
   FROM nft20_user_view;

-- Permissions

ALTER TABLE public.nft20_score OWNER TO doadmin;
GRANT ALL ON TABLE public.nft20_score TO doadmin;
GRANT SELECT ON TABLE public.nft20_score TO reader;
