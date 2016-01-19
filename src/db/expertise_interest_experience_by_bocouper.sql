WITH latest_expertise_log AS (
  SELECT ee.employee_id, ee.expertise_id, MAX(ee.created_at) AS latest
  FROM employee_expertise ee
  INNER JOIN employee e ON e.id=ee.employee_id
  WHERE e.slack=?
  GROUP BY employee_id, expertise_id
)
SELECT
  (ee.interest_rating * 100) + ee.experience_rating AS weight,
  ARRAY[ee.interest_rating, ee.experience_rating] AS interest_experience,
  STRING_AGG(exp.name, ', ' ORDER BY exp.name) AS expertise
FROM latest_expertise_log lel
INNER JOIN employee_expertise ee ON
  ee.employee_id=lel.employee_id AND
  ee.expertise_id=lel.expertise_id AND
  created_at=lel.latest
INNER JOIN employee e ON e.id=ee.employee_id
INNER JOIN expertise exp ON exp.id=ee.expertise_id
GROUP BY interest_experience, weight
