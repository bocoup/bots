SELECT
  STRING_AGG(exp.name, ', ' ORDER BY exp.name) AS outstanding
FROM employee e, expertise exp
WHERE e.slack=?
AND (
  SELECT count(*)
  FROM employee_expertise ee
  WHERE ee.employee_id=e.id AND ee.expertise_id=exp.id
) = 0
