SELECT
  exp.id AS id,
  exp.name AS expertise,
  et.name AS type,
  ea.name AS area
FROM employee e, expertise exp
INNER JOIN expertise_area ea ON ea.id=exp.expertise_area_id
INNER JOIN expertise_type et ON et.id=exp.expertise_type_id
WHERE e.slack=?
AND (
  SELECT count(*)
  FROM employee_expertise ee
  WHERE ee.employee_id=e.id AND ee.expertise_id=exp.id
) = 0
ORDER BY exp.name
