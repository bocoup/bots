UPDATE employee
SET meta = jsonb_merge(
  meta,
  concat('{"last_thanksbot_reminder":"',CURRENT_DATE,'"}')::jsonb
)
WHERE slack=?
