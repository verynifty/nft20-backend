CREATE OR REPLACE VIEW public.nft20_staking
AS SELECT mt."from",
    mt."to",
    mt.amount,
    mt.blocknumber,
    mt.transactionhash,
    mt.logindex,
    mt."timestamp",
    mt.sender,
    mt.receiver,
        CASE
            WHEN mt.receiver::text = '0x4ffde8e98227c17a64a9df30dfb1d3049457c5db'::text THEN mt.amount
            WHEN mt.sender::text = '0x4ffde8e98227c17a64a9df30dfb1d3049457c5db'::text THEN - mt.amount
            ELSE 0::numeric
        END AS staked
   FROM muse_transfers mt
  WHERE (mt.receiver::text = '0x4ffde8e98227c17a64a9df30dfb1d3049457c5db'::text OR mt.sender::text = '0x4ffde8e98227c17a64a9df30dfb1d3049457c5db'::text) AND mt.sender::text <> '0x6fba46974b2b1befefa034e236a32e1f10c5a148'::text;

-- Permissions

ALTER TABLE public.nft20_staking OWNER TO doadmin;
GRANT ALL ON TABLE public.nft20_staking TO doadmin;
GRANT SELECT ON TABLE public.nft20_staking TO reader;


CREATE OR REPLACE VIEW public.nft20_staking_new
AS SELECT mt."from",
    mt."to",
    mt.amount,
    mt.blocknumber,
    mt.transactionhash,
    mt.logindex,
    mt."timestamp",
    mt.sender,
    mt.receiver,
        CASE
            WHEN mt.receiver::text = '0x9cfc1d1a45f79246e8e074cfdfc3f4aacdde8d9a'::text THEN mt.amount
            WHEN mt.sender::text = '0x9cfc1d1a45f79246e8e074cfdfc3f4aacdde8d9a'::text THEN - mt.amount
            ELSE 0::numeric
        END AS staked
   FROM muse_transfers mt
  WHERE (mt.receiver::text = '0x9cfc1d1a45f79246e8e074cfdfc3f4aacdde8d9a'::text OR mt.sender::text = '0x4ffde8e98227c17a64a9df30dfb1d3049457c5db'::text) AND mt.sender::text <> '0x6fba46974b2b1befefa034e236a32e1f10c5a148'::text;
