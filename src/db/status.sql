SELECT
  e.first||' '||e.last AS bocouper,
  check_in_person.first||' '||check_in_person.last AS check_in_person,
  ut.name AS utilization_type,
  lrt.name AS leave_type,
  i.name AS initiative,
  p.name AS project
FROM utilization AS u
INNER JOIN employee AS e ON e.id=u.employee_id
INNER JOIN employee AS check_in_person ON check_in_person.id=e.supporter_id
LEFT JOIN leave_request_type AS lrt ON lrt.id=u.leave_request_type_id
LEFT JOIN project AS p ON p.id=u.project_id
LEFT JOIN project_phase AS pp ON pp.id=u.project_phase_id
LEFT JOIN utilization_type AS ut ON ut.id=COALESCE(pp.utilization_type_id, u.utilization_type_id)
LEFT JOIN initiative AS i ON i.id=COALESCE(pp.initiative_id, u.initiative_id)
WHERE (
  CURRENT_DATE BETWEEN u.first_day AND u.last_day AND
  u.sketch_calendar_id IS null AND
  e.slack = ?
)
