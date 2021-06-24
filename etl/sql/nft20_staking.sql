CREATE OR REPLACE VIEW nft20_staking
as
select *, 	case
		when receiver='0x4ffde8e98227c17a64a9df30dfb1d3049457c5db'  then amount 
		when sender='0x4ffde8e98227c17a64a9df30dfb1d3049457c5db'  then -amount  else 0 end as staked
		from muse_transfers mt where (receiver='0x4ffde8e98227c17a64a9df30dfb1d3049457c5db' or sender='0x4ffde8e98227c17a64a9df30dfb1d3049457c5db') and sender != '0x6fba46974b2b1befefa034e236a32e1f10c5a148' 