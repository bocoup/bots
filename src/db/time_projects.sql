SELECT
  short_code,
  organization.name as org,
  project.name as project
FROM timesheet_project
  LEFT JOIN project on timesheet_project.project_id = project.id
  LEFT JOIN organization on project.organization_id = organization.id
