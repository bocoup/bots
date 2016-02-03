SELECT
  STRING_AGG(e.first||' '||e.last, ', ' ORDER BY e.last, e.first) AS employees
FROM employee e, expertise exp
WHERE e.last_day IS null AND exp.id=?
AND (
  SELECT count(*)
  FROM employee_expertise ee
  WHERE ee.employee_id=e.id AND ee.expertise_id=exp.id
) = 0
