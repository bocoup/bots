WITH data AS (
    SELECT
        ? as slack_id,
        ? as pronouns,
        ? as work_start_time
        ? as work_end_time
        ? as work_hours_exceptions
        ? as not_urgent_comm_prefs
        ? as urgent_comm_prefs
), emp AS (
    SELECT id FROM employee WHERE slack=data.slack_id
)
INSERT INTO comm_prefs (
  employee_id,
  pronouns,
  work_start_time
) VALUES (
  emp.id,
  data.pronouns,
  data.work_start_time
  data.work_end_time
  data.work_hours_exceptions
  data.not_urgent_comm_prefs
  data.urgent_comm_prefs
)
ON CONFLICT DO UPDATE
        SET
           pronouns=data.pronouns,
           work_start_time=data.work_start_time
           work_end_time=data.work_end_time
           work_hours_exceptions=data.work_hours_exceptions
           not_urgent_comm_prefs=data.not_urgent_comm_prefs
           urgent_comm_prefs=data.urgent_comm_prefs
        WHERE employee_id = emp.id;