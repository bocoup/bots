INSERT INTO timesheet ( project_id, employee_id, duration, notes )
SELECT
  project_id,
  employee.id as employee_id,
  ?::interval as duration,
  ? as notes
  FROM timesheet_project, employee
  WHERE LOWER(timesheet_project.short_code) = LOWER(?)
    AND LOWER(employee.slack) = LOWER(?)
RETURNING *

