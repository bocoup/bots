SELECT
  e.first||' '||e.last AS bocouper,
  ut.name AS utilization_type,
  lrt.name AS leave_type,
  i.name AS initiative,
  bu.name AS business_unit,
  p.name AS project
FROM utilization AS u
INNER JOIN employee AS e ON e.id=u.employee_id
INNER JOIN utilization_type AS ut ON ut.id=u.utilization_type_id
LEFT JOIN leave_request_type AS lrt ON lrt.id=u.leave_request_type_id
INNER JOIN initiative AS i ON i.id=u.initiative_id
INNER JOIN business_unit bu ON bu.id=ut.business_unit_id
LEFT JOIN project AS p ON p.id=u.project_id
WHERE (
  CURRENT_DATE BETWEEN u.first_day AND u.last_day AND
  u.utilization_type_id = 11 AND
  u.sketch_calendar_id IS null
)
