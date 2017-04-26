SELECT
  project.short_code,
  date(date_trunc('week', effortsheet.day))::text as week,
  effortsheet.points,
  string_agg(effortsheet.notes, '; ') as notes
FROM effortsheet
  LEFT JOIN project ON effortsheet.project_id = project.id
WHERE project.short_code = ?
GROUP BY 1, 2
ORDER BY week DESC,
  project.short_code
LIMIT 5
