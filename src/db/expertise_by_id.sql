SELECT
  e.name AS "Expertise",
  et.name AS "Type",
  ea.name AS "Area"
FROM expertise e
INNER JOIN expertise_area ea ON ea.id=e.expertise_area_id
INNER JOIN expertise_type et ON et.id=e.expertise_type_id
WHERE e.id=?
