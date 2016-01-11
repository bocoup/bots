WITH latest_expertise_log AS (
  SELECT employee_id, expertise_id, MAX(created_at) AS latest
  FROM employee_expertise
  WHERE expertise_id=?
  GROUP BY employee_id, expertise_id
)
SELECT
  e.first AS "First Name",
  e.last AS "Last Name",
  ee.interest_rating AS "Interest",
  ee.experience_rating AS "Experience",
  ee.created_at AS "Last Updated"
FROM latest_expertise_log lel
INNER JOIN employee_expertise ee ON
  ee.employee_id=lel.employee_id AND
  ee.expertise_id=lel.expertise_id AND
  created_at=lel.latest
INNER JOIN employee e ON e.id=ee.employee_id
ORDER BY ee.experience_rating DESC, ee.interest_rating DESC, e.last, e.first
