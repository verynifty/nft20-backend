
CREATE TABLE public.pepevote (
	address varchar NULL,
	amount numeric NULL,
	"time" timestamp NULL,
	nft_address varchar NULL
);

CREATE OR REPLACE VIEW pepevote_clean_view
as
select address , "time" , nft_address, amount , rn
from (
  select address , "time" , nft_address, amount,
         row_number() over (partition by address , nft_address order by "time" desc) as rn
  from pepevote p2 
           WHERE time > now() - interval '2' day
) t
where rn = 1
order by "time" ;

