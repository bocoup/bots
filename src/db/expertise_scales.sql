SELECT 'interest' AS type, id, name FROM interest_scale
UNION ALL
SELECT 'experience' AS type, id, name FROM experience_scale
ORDER BY id
