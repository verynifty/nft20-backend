-- Drop table

-- DROP TABLE public.nft20_webhooks;

CREATE TABLE public.nft20_webhooks (
	"name" varchar NULL,
	id varchar NULL,
	"token" varchar NULL
);

-- Permissions

ALTER TABLE public.nft20_webhooks OWNER TO doadmin;
GRANT ALL ON TABLE public.nft20_webhooks TO doadmin;
GRANT SELECT ON TABLE public.nft20_webhooks TO reader;
