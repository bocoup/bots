SELECT
  short_code as code,
  organization.name as org,
  project.name as project
FROM project
  LEFT JOIN organization on project.organization_id = organization.id
  WHERE short_code IS NOT NULL
