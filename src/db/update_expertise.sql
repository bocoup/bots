INSERT INTO employee_expertise (
  employee_id,
  expertise_id,
  experience_rating,
  interest_rating,
  notes
) VALUES (
  (SELECT id FROM employee WHERE slack=?),
  ?,
  ?,
  ?,
  ?
)
