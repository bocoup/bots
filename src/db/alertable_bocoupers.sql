SELECT slack
FROM employee
WHERE last_day IS null
AND slack IS NOT null
-- skip team members who opted out
AND ((meta->>'mute_thanksbot_reminder')::boolean) IS NOT true
-- only accept team members who are in for the day
AND EXISTS (
  SELECT true
  FROM utilization
  WHERE CURRENT_DATE BETWEEN first_day AND last_day
  AND leave_request_type_id IS null
  AND employee_id = employee.id
)
-- skip team members who sent a message today already
AND NOT EXISTS (
  SELECT true
  FROM thanksbot_log
  WHERE sender = employee.slack
  AND created_at > CURRENT_DATE
);
