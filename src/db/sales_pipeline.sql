WITH weighted_deals AS (
  SELECT
    created_at,
    stage,
    value,
    CASE
      WHEN stage = 1 THEN 0
      WHEN stage = 2 THEN 0.01
      WHEN stage = 3 THEN 0.05
      WHEN stage = 4 THEN 0.15
      WHEN stage = 5 THEN 0.40
      WHEN stage = 6 THEN 0.60
      WHEN stage = 7 THEN 0.90
    END AS weight
  FROM deal
  WHERE status = 'open'
  AND created_at = (SELECT MAX(created_at) FROM deal)
  AND pipeline_id = 1
)
SELECT
  EXTRACT(epoch FROM MAX(created_at)) AS created_at,
  COUNT(*) AS deals,
  wd.stage AS stage,
  ROUND(SUM(wd.value * wd.weight)) AS value
FROM weighted_deals AS wd
GROUP BY stage
ORDER BY stage;
