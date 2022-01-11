select
    id
  from
    (
    select
      CONCAT(na.nft, '_', na.id) as id
    from
      nft20_action na
    group by
      nt.nft,
      nt.id) t
  where
    t.id not in (
    select
      concat(n.address, '_', n.token_id)
    from
      nft n
    group by
      n.address ,
      n.token_id )