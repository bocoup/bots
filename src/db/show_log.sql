
SELECT
  project.short_code as project,
  employee.slack as employee,
  timesheet.duration,
  timesheet.day,
  timesheet.notes
FROM timesheet
  LEFT JOIN project on timesheet.project_id = project.id
  LEFT JOIN employee on timesheet.employee_id = employee.id
ORDER BY
  timesheet.day DESC,
  timesheet.id DESC
LIMIT ?
