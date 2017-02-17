SELECT
  project.short_code,
  to_char(date_trunc('week', timesheet.day), 'YYYY-MM-DD') as week,
  extract(epoch from sum(timesheet.duration)) / 3600 as hours,
  string_agg(timesheet.notes, '; '::text) as notes
FROM timesheet
  LEFT JOIN project ON timesheet.project_id = project.id
WHERE project.short_code = ?
GROUP BY 1, 2
ORDER BY week DESC,
  project.short_code
LIMIT 5
