WITH range AS (
  SELECT generate_series(
    DATE_TRUNC('year', CURRENT_DATE),
    CURRENT_DATE+interval '30 days',
    '1 day'
  ) AS day
),
schedule AS (
  SELECT r.day FROM range r WHERE EXTRACT('dow' FROM r.day) NOT IN (0,6)
),
position_history AS (
 SELECT eph1.*, (
    SELECT date(eph2.first_day-interval '1 day')
    FROM employee_position_history eph2
    WHERE eph2.employee_id = eph1.employee_id
    AND eph2.first_day > eph1.first_day
    ORDER BY eph2.first_day ASC LIMIT 1
  ) AS last_day
  FROM employee_position_history AS eph1
),
count_billable_utilization AS (
  SELECT
    s.day,
    COUNT(*) AS total
  FROM schedule AS s
  LEFT JOIN utilization u ON (
    s.day BETWEEN u.first_day AND u.last_day AND
    u.sketch_calendar_id IS null AND
    u.billable IS true
  )
  GROUP BY s.day
),
count_billable_employee AS (
  SELECT
    s.day,
    COUNT(*) AS total
  FROM schedule AS s
  INNER JOIN position_history AS ph ON (
    s.day BETWEEN ph.first_day AND COALESCE(ph.last_day, '3000-01-01')
  )
  INNER JOIN employee e ON (
    e.id=ph.employee_id AND
    s.day BETWEEN e.first_day AND COALESCE(e.last_day, '3000-01-01')
  )
  WHERE ph.is_billable IS true
  GROUP BY s.day
),
utilization_rate AS (
  SELECT
    cbe.day,
    cbe.total AS billable_engineers,
    cbu.total AS billable_utilizations,
    cbu.total::numeric / cbe.total::numeric * 100 AS rate
  FROM count_billable_employee AS cbe, count_billable_utilization AS cbu
  WHERE cbe.day = cbu.day
)
SELECT
  ROUND(AVG(ur.rate) FILTER (
    WHERE ur.day BETWEEN CURRENT_DATE-interval '30 days' AND CURRENT_DATE
  )) AS last_30_days,
  ROUND(AVG(ur.rate) FILTER (
    WHERE ur.day BETWEEN CURRENT_DATE AND CURRENT_DATE+interval '30 days'
  )) AS next_30_days,
  ROUND(AVG(ur.rate) FILTER (
    WHERE ur.day <= CURRENT_DATE
  )) AS ytd,
  (SELECT cbe.total FROM count_billable_employee AS cbe WHERE cbe.day = CURRENT_DATE) AS billable_count
FROM utilization_rate AS ur
