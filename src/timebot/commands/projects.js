import {query} from '../../lib/db';

import {createCommand} from 'chatter';

export default createCommand({
  name: 'projects',
  description: 'List all available projects for timesheet',
}, () => {
  return query('time_projects')
    .then(projects => `Projects:
${projects
  .map(({ short_code, project, org }) => `*${short_code}*: ${org}: ${project}`)
  .join('\n')
}`
    )
});
