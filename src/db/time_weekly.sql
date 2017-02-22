WITH input as (
  SELECT
    date_trunc('week', current_date + ?::interval) as input_date
), params as (
  SELECT
    input_date as presentday,
    date_trunc('week', input_date - interval '12 weeks') as historyday
  FROM input
), weekly as (
  SELECT
    project.short_code,
    date_trunc('week', timesheet.day) as startday,
    extract(epoch from sum(timesheet.duration)) / 3600 as hours
  FROM timesheet
    LEFT JOIN project ON timesheet.project_id = project.id
  GROUP BY 1, 2
  ORDER BY startday DESC,
    project.short_code
), active_range as (
  SELECT
    short_code,
    CASE
      WHEN min(startday) > historyday THEN min(startday)
      ELSE historyday
    END as range_start,
    CASE
      WHEN max(startday) < presentday THEN max(startday)
      ELSE presentday
    END as range_end
  FROM weekly, params
    GROUP BY short_code, historyday, presentday
), each_week as (
  SELECT short_code, generate_series(range_start, range_end, '1 week') as week
    FROM active_range
), filled_weekly as (
  SELECT
    each_week.short_code,
    each_week.week,
    COALESCE(weekly.hours, 0) as hours
  FROM each_week
    LEFT JOIN weekly ON each_week.week = weekly.startday AND each_week.short_code = weekly.short_code
), current as (
  SELECT * FROM weekly, params WHERE startday = presentday
), summary as (
  SELECT
    weekly.short_code,
    range_start,
    range_end,
    sum(weekly.hours)::decimal(10,2) as total_hours,
    avg(weekly.hours)::decimal(10,2) as avg_hours,
    COALESCE(project.target_hours_weekly, avg(weekly.hours)::decimal(10,2)) AS target_hours,
    COALESCE(current.hours, 0) as current_hours
  FROM filled_weekly weekly
    LEFT JOIN project ON weekly.short_code = project.short_code
    LEFT JOIN active_range on weekly.short_code = active_range.short_code
    LEFT JOIN current on weekly.short_code = current.short_code
  GROUP BY weekly.short_code, active_range.range_end, active_range.range_start,
    current.hours, project.target_hours_weekly
)
SELECT
  short_code,
  to_char(range_start, 'YYYY-MM-DD') as first_week,
  to_char(range_end, 'YYYY-MM-DD') as last_week,
  total_hours,
  avg_hours,
  target_hours,
  current_hours,
  current_hours / target_hours as ratio,
  target_hours - current_hours as behind
FROM summary
  ORDER BY short_code
