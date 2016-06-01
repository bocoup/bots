import {createCommand} from 'chatter';
import {getIntExpScales} from './lib/query';

export default createCommand({
  name: 'scales',
  description: 'List interest and experience scales.',
}, () => {
  return getIntExpScales().then(({interest, experience}) => {
    const list = o => Object.keys(o).map(k => `> *${k}.* ${o[k]}`);
    return [
      '*Interest:*',
      list(interest),
      '*Experience:*',
      list(experience),
    ];
  });
});
