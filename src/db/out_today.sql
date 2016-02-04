SELECT e.first||' '||e.last AS bocouper
FROM utilization u
INNER JOIN employee e ON e.id=u.employee_id
WHERE (
  u.leave_request_type_id IS NOT null AND
  CURRENT_DATE BETWEEN u.first_day AND u.last_day
);
