WITH range AS (
  SELECT generate_series(
    ?::date,
    ?::date,
    '1 day'
  ) AS day
)
SELECT COUNT(*) FROM range AS r WHERE EXTRACT('dow' FROM r.day) NOT IN (0,6)
