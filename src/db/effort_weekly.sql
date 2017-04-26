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
    date_trunc('week', effortsheet.day) as startday,
    sum(points) AS points
  FROM effortsheet
    LEFT JOIN project ON effortsheet.project_id = project.id
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
    COALESCE(weekly.points, 0) as points
  FROM each_week
    LEFT JOIN weekly ON each_week.week = weekly.startday AND each_week.short_code = weekly.short_code
), current as (
  SELECT * FROM weekly, params WHERE startday = presentday
), summary as (
  SELECT
    weekly.short_code,
    range_start,
    range_end,
    sum(weekly.points)::decimal(10,2) as total_points,
    avg(weekly.points)::decimal(10,2) as avg_points,
    COALESCE(project.target_points_weekly, avg(weekly.points)::decimal(10,2)) AS target_points,
    COALESCE(current.points, 0) as current_points
  FROM filled_weekly weekly
    LEFT JOIN project ON weekly.short_code = project.short_code
    LEFT JOIN active_range on weekly.short_code = active_range.short_code
    LEFT JOIN current on weekly.short_code = current.short_code
  GROUP BY weekly.short_code, active_range.range_end, active_range.range_start,
    current.points, project.target_points_weekly
)
SELECT
  short_code,
  date(range_start)::text as first_week,
  date(range_end)::text as last_week,
  total_points,
  avg_points,
  target_points,
  current_points,
  current_points / target_points as ratio,
  target_points - current_points as gap
FROM summary
  ORDER BY short_code
