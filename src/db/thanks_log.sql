SELECT
  sender,
  message,
  created_at AT TIME ZONE 'EST' AS created_at
FROM thanksbot_log
WHERE created_at > (CURRENT_DATE - INTERVAL '7 days')
ORDER BY created_at;
