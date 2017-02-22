SELECT
  project.short_code,
  date(date_trunc('week', timesheet.day))::text as week,
  extract(epoch from sum(timesheet.duration)) / 3600 as hours,
  string_agg(timesheet.notes, '; ') as notes
FROM timesheet
  LEFT JOIN project ON timesheet.project_id = project.id
WHERE project.short_code = ?
GROUP BY 1, 2
ORDER BY week DESC,
  project.short_code
LIMIT 5
