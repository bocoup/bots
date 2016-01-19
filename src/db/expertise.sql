SELECT
  STRING_AGG(e.name, ', ' ORDER BY e.name ASC) AS expertise,
  ea.name AS area
FROM expertise e
INNER JOIN expertise_area ea ON ea.id=e.expertise_area_id
INNER JOIN expertise_type et ON et.id=e.expertise_type_id
GROUP BY ea.name
ORDER BY ea.name
