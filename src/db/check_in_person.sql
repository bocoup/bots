SELECT
  e.first||' '||e.last AS name
FROM employee AS e
WHERE id = (
  SELECT supporter_id FROM employee WHERE slack=?
);
