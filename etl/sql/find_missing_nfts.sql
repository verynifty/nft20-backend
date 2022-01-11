select
    id
  from
    (
    select
      CONCAT(nt.nft, '_', nt.id) as id
    from
      nft20_action nt
    group by
      nt.nft,
      nt.id) t
  where
    t.id not in (
    select
      concat(n.nft_contract , '_', n.nft_id)
    from
      nft20_nft n
    group by
      n.nft_contract ,
      n.nft_id )a