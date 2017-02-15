INSERT INTO timesheet ( project_id, employee_id, duration, notes )
SELECT
  project.id as project_id,
  employee.id as employee_id,
  ?::interval as duration,
  ? as notes
  FROM project, employee
  WHERE LOWER(project.short_code) = LOWER(?)
    AND LOWER(employee.slack) = LOWER(?)
RETURNING *

