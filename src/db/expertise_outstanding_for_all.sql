SELECT
  e.slack,
  ARRAY_AGG(exp.name) AS outstanding
FROM employee e, expertise exp
WHERE e.last_day IS null
AND (
  SELECT count(*)
  FROM employee_expertise ee
  WHERE ee.employee_id=e.id AND ee.expertise_id=exp.id
) = 0
AND exp.description IS NOT null
GROUP BY e.slack
