SELECT
  e.id AS id,
  e.name AS expertise,
  e.description AS description,
  et.name AS type,
  ea.name AS area
FROM expertise e
INNER JOIN expertise_area ea ON ea.id=e.expertise_area_id
INNER JOIN expertise_type et ON et.id=e.expertise_type_id
WHERE e.name ILIKE '%'||?::text||'%'
