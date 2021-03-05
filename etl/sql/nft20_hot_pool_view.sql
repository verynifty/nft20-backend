CREATE OR REPLACE view public.nft20_hot_pool_view AS
SELECT "public"."nft20_pair".*, count(distinct "Nft20 History"."user") AS "count"
FROM "public"."nft20_pair"
LEFT JOIN "public"."nft20_history" "Nft20 History" ON "public"."nft20_pair"."address" = "Nft20 History"."address"
WHERE CAST("Nft20 History"."timestamp" AS date) BETWEEN CAST((CAST(now() AS timestamp) + (INTERVAL '-7 day')) AS date)
   AND CAST(now() AS date)
GROUP BY "public"."nft20_pair"."address"
ORDER BY "count" DESC
