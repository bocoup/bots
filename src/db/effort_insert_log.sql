INSERT INTO effortsheet ( project_id, employee_id, points, notes )
SELECT
  project.id as project_id,
  employee.id as employee_id,
  effortsheet.points,
  ? as notes
  FROM project, employee
  WHERE LOWER(project.short_code) = LOWER(?)
    AND LOWER(employee.slack) = LOWER(?)
RETURNING *
