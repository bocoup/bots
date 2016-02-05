-- a row for each day of the year so far
WITH range AS (
  SELECT generate_series(
    DATE_TRUNC('year', CURRENT_DATE),
    CURRENT_DATE,
    '1 day'
  ) AS day
),
-- limit the rows above to weekdays
schedule_to_date AS (
  SELECT r.day FROM range r WHERE EXTRACT('dow' FROM r.day) NOT IN (0,6)
),
-- the full position history of all team members at the company
position_history AS (
 SELECT
    eph1.*,
    (
      SELECT date(eph2.first_day-interval '1 day')
      FROM employee_position_history eph2
      WHERE eph2.employee_id = eph1.employee_id
      AND eph2.first_day > eph1.first_day
      ORDER BY eph2.first_day ASC LIMIT 1
    ) AS last_day
    FROM employee_position_history AS eph1
),
-- the count of billable team members on every day in our defined range
billable_history AS (
  SELECT
    std.day,
    ph.employee_id
  FROM schedule_to_date AS std
  INNER JOIN position_history AS ph ON (
    std.day BETWEEN ph.first_day AND COALESCE(ph.last_day, '3000-01-01')
  )
  INNER JOIN employee e ON (
    e.id=ph.employee_id AND
    std.day BETWEEN e.first_day AND COALESCE(e.last_day, '3000-01-01')
  )
  WHERE ph.is_billable IS true
),
-- the number of team members who were billable on the first day of the year
count_billable_first_of_year AS (
  SELECT COUNT(*) AS total
  FROM billable_history AS bh
  WHERE bh.day = DATE_TRUNC('year', CURRENT_DATE)
),
-- the number of team members who are billable today
count_billable_today AS (
  SELECT COUNT(*) AS total
  FROM billable_history AS bh
  WHERE bh.day = CURRENT_DATE
),
-- a cartesian product of all days of the year so far and all team members
schedule_for_all AS (
  SELECT std.day, e.* FROM schedule_to_date AS std, employee AS e
),
-- the number of perch weeks for every bocouper this year
weeks_all AS (
  SELECT
    sfa.id AS employee_id,
    sfa.is_billable,
    ROUND((COUNT(u.*)/5.0),2) AS total
  FROM schedule_for_all sfa
  LEFT JOIN utilization u ON (
    sfa.day BETWEEN u.first_day AND u.last_day AND
    u.utilization_type_id = 11 AND
    u.sketch_calendar_id IS null AND
    u.employee_id = sfa.id AND
    u.verified IS true
  )
  GROUP BY sfa.id, sfa.is_billable
),
-- the average number of weeks billable team members have had this year
avg_weeks_all AS (
  SELECT ROUND(AVG(wa.total),2) AS total
  FROM weeks_all AS wa
  WHERE wa.is_billable IS true
),
-- the total number of weeks billable team members have had this year
count_weeks_all AS (
  SELECT SUM(wa.total) AS total
  FROM weeks_all AS wa
  WHERE wa.is_billable IS true
),
-- the number of planned weeks in perch this year
planned_weeks_all AS (
  SELECT (cbt.total*4) AS total
  FROM count_billable_today AS cbt
),
-- the number of team members who have had more than four weeks of perch this year
count_had_four_weeks AS (
  SELECT COUNT(wa.*) AS total
  FROM weeks_all AS wa WHERE total >= 4
),
-- the bocouper whos perch time we are analyzing
bocouper AS (
  SELECT * FROM employee WHERE slack = ?
),
-- the number of actual perch weeks this year for the requested bocouper
count_weeks_you AS (
  SELECT wa.total AS total
  FROM weeks_all AS wa
  WHERE wa.employee_id = (SELECT id FROM bocouper)
),
-- the number of planned perch weeks this year for the requested bocouper
planned_weeks_you AS (
  SELECT
    ROUND(CASE
      WHEN b.first_day < date_trunc('year', CURRENT_DATE) THEN 4
      ELSE ((EXTRACT('DOY' FROM b.first_day) / 365) * 4)
    END::numeric,2) AS total
  FROM bocouper AS b
),
-- what percentage into the year we are
percentage_into_year AS (
  SELECT (EXTRACT('DOY' FROM CURRENT_DATE) / 365) AS total
),
-- the difference between our actual and planned weeks this year so far
target_differential AS (
  SELECT ROUND((pwa.total*piy.total)::numeric,2) - cwa.total AS total
  FROM
    planned_weeks_all AS pwa,
    percentage_into_year AS piy,
    count_weeks_all AS cwa
)
-- put it all together!
SELECT
  cwy.total AS count_weeks_you,
  pwy.total AS planned_weeks_you,
  ROUND(((cwy.total/4)*100),2) AS percentage_weeks_you,
  chfw.total AS count_had_four_weeks,
  cbt.total AS count_billable_today,
  awa.total AS avg_weeks_all,
  cwa.total AS total_weeks_all,
  cbt.total-cbfoy.total AS count_billable_change,
  ABS(td.total) AS target_differential,
  CASE
    WHEN td.total > 0 THEN 'under'
    WHEN td.total < 0 THEN 'over'
    ELSE 'on target'
  END AS target_status,
  CASE WHEN b.is_billable THEN 'are' ELSE 'are not' END AS billable_status,
  date_part('year', CURRENT_DATE) AS year
FROM
  count_weeks_you AS cwy,
  planned_weeks_you AS pwy,
  avg_weeks_all AS awa,
  count_had_four_weeks AS chfw,
  count_billable_today AS cbt,
  count_billable_first_of_year AS cbfoy,
  count_weeks_all AS cwa,
  target_differential AS td,
  bocouper AS b
