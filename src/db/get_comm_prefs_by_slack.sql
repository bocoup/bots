SELECT *
    FROM comm_prefs cp
        LEFT JOIN employee e ON cp.employee_id = e.id
    WHERE e.slack = ?;