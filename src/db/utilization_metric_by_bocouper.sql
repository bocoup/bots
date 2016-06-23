-- a row for each day in a defined range
WITH range AS (
  SELECT generate_series(
    ?::date,
    ?::date,
    '1 day'
  ) AS day
),
-- limit the rows above to weekdays
schedule AS (
  SELECT r.day FROM range AS r WHERE EXTRACT('dow' FROM r.day) NOT IN (0,6)
),
-- all utilizations within the range specified
utilizations AS (
  SELECT
    s.day,
    u.billable AS is_billable,
    u.leave_request_type_id,
    u.utilization_type_id,
    s.day < CURRENT_DATE AS is_past
  FROM schedule AS s
  INNER JOIN utilization AS u ON (
    s.day BETWEEN u.first_day AND u.last_day AND
    u.sketch_calendar_id IS null AND
    u.employee_id = (SELECT id FROM employee WHERE slack=?)
  )
),
-- count all utilizations per utilization type, earlier than today
past_utilization_type_counts AS (
  SELECT
    ut.id,
    ut.name,
    COALESCE(u.is_billable, false) AS is_billable,
    SUM(CASE WHEN u.day IS NULL then 0 ELSE 1 END)::integer AS total
  FROM utilization_type AS ut
  LEFT JOIN utilizations u ON (
    u.utilization_type_id=ut.id AND
    u.is_past IS true AND
    u.leave_request_type_id IS null
  )
  GROUP BY name, id, is_billable
),
-- count all utilizations per utilization type, later than today
future_utilization_type_counts AS (
  SELECT
    ut.id,
    ut.name,
    COALESCE(u.is_billable, false) AS is_billable,
    SUM(CASE WHEN u.day IS NULL then 0 ELSE 1 END)::integer AS total
  FROM utilization_type AS ut
  LEFT JOIN utilizations u ON (
    u.utilization_type_id=ut.id AND
    u.is_past IS false AND
    u.leave_request_type_id IS null
  )
  GROUP BY name, id, is_billable
),
-- count all utilizations per leave request type, earlier than today
past_leave_counts AS (
  SELECT
    lrt.id,
    lrt.name,
    COALESCE(u.is_billable, false) AS is_billable,
    SUM(CASE WHEN u.day IS NULL then 0 ELSE 1 END)::integer AS total
  FROM leave_request_type AS lrt
  LEFT JOIN utilizations u ON (
    u.leave_request_type_id=lrt.id AND
    u.is_past IS true
  )
  GROUP BY name, id, is_billable
),
-- counts all utilizations per leave request type, later than today
future_leave_counts AS (
  SELECT
    lrt.id,
    lrt.name,
    COALESCE(u.is_billable, false) AS is_billable,
    SUM(CASE WHEN u.day IS NULL then 0 ELSE 1 END)::integer AS total
  FROM leave_request_type AS lrt
  LEFT JOIN utilizations u ON (
    u.leave_request_type_id=lrt.id AND
    u.is_past IS false
  )
  GROUP BY name, id, is_billable
)
SELECT
  'past'::text AS timeframe,
  'utilization'::text AS type,
  putc.*
FROM past_utilization_type_counts AS putc
UNION ALL
SELECT
  'future'::text AS timeframe,
  'utilization'::text AS type,
  futc.*
FROM future_utilization_type_counts AS futc
UNION ALL
SELECT
  'past'::text AS timeframe,
  'leave'::text AS type,
  plc.*
FROM past_leave_counts AS plc
UNION ALL
SELECT
  'future'::text AS timeframe,
  'leave'::text AS type,
  flc.*
FROM future_leave_counts AS flc
ORDER BY total DESC;
