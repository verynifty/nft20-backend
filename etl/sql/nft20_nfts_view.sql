CREATE OR REPLACE VIEW public.nft20_nfts_view
AS SELECT p.address AS pool,
    n.nft_contract,
    n.nft_id,
    n.nft_image,
    n.nft_title,
    n.nft_description,
    sum(a.amount) AS availabe_quantity
   FROM nft20_action a,
    nft20_nft n,
    nft20_pair p
  WHERE n.nft_contract::text = a.nft::text AND n.nft_id = a.id AND p.nft::text = n.nft_contract::text
  GROUP BY p.address, n.nft_contract, n.nft_id, n.nft_image, n.nft_title, n.nft_description;