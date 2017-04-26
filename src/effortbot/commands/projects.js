import {query} from '../../lib/db';

import {createCommand} from 'chatter';

export default createCommand({
  name: 'projects',
  description: 'List all available projects for effortsheet',
}, () => {
  return query('time_projects')
    .then(projects => `Projects:
${projects
  .map(({code, project, org}) => `*${code}*: ${org}: ${project}`)
  .join('\n')
}`
    );
});
