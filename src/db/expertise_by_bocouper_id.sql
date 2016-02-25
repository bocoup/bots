WITH latest_expertise_log AS (
  SELECT ee.employee_id, ee.expertise_id, MAX(ee.created_at) AS latest
  FROM employee_expertise ee
  INNER JOIN employee e ON e.id=ee.employee_id
  WHERE e.slack=?
  GROUP BY employee_id, expertise_id
)
SELECT
  exp.id AS id,
  exp.name AS expertise,
  ee.interest_rating AS interest,
  ee.experience_rating AS experience,
  et.name AS type,
  ea.name AS area,
  DATE_PART('days', (CURRENT_DATE-lel.latest)) AS days_since_last_update
FROM latest_expertise_log lel
INNER JOIN employee_expertise ee ON
  ee.employee_id=lel.employee_id AND
  ee.expertise_id=lel.expertise_id AND
  ee.created_at=lel.latest
INNER JOIN employee e ON e.id=ee.employee_id
INNER JOIN expertise exp ON exp.id=ee.expertise_id
INNER JOIN expertise_area ea ON ea.id=exp.expertise_area_id
INNER JOIN expertise_type et ON et.id=exp.expertise_type_id
WHERE exp.id=?
