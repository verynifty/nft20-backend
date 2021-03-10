create materialized view nft20_user_view AS
select
	h.user as address,
	u."name",
	coalesce (sum(h.total_transfers),
	0) as nft_traded,
	coalesce(count(distinct (h.transactionhash)), 0) as transactions,
	coalesce(count(distinct (h.nft)), 0) as pools_traded,
	coalesce (SUM(receive.amount / 1e18 ), 0) as total_muse_received,
	coalesce (COUNT(distinct(v.id )), 0) as vnfts
from
	nft20_history h
left join nft20_user u on
	h."user" ::text = u.address::text
	left join muse_transfers receive  on
	  h."user"::text = concat('0x',receive.receiver )::text
	  	left join vnft v  on
	  h."user"::text = concat('0x',v."owner" )::text and not v.isdead 
group by
	h.user ,
	u."name"
	

 CREATE UNIQUE INDEX nft20_user_view_address ON nft20_user_view(address);
