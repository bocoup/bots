WITH latest_expertise_log AS (
  SELECT ee.employee_id, ee.expertise_id, MAX(ee.created_at) AS latest
  FROM employee_expertise ee
  INNER JOIN employee e ON e.id=ee.employee_id
  WHERE e.slack=?
  GROUP BY employee_id, expertise_id
)
SELECT
  e.first AS "First Name",
  e.last AS "Last Name",
  exp.name AS "Expertise",
  et.name AS "Type",
  ea.name AS "Area",
  ee.interest_rating AS "Interest",
  ee.experience_rating AS "Experience",
  ee.created_at AS "Last Updated"
FROM latest_expertise_log lel
INNER JOIN employee_expertise ee ON
  ee.employee_id=lel.employee_id AND
  ee.expertise_id=lel.expertise_id AND
  created_at=lel.latest
INNER JOIN employee e ON e.id=ee.employee_id
INNER JOIN expertise exp ON exp.id=ee.expertise_id
INNER JOIN expertise_area ea ON ea.id=exp.expertise_area_id
INNER JOIN expertise_type et ON et.id=exp.expertise_type_id
ORDER BY e.last, e.first, et.name, exp.name, ea.name
