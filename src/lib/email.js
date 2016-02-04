import Promise from 'bluebird';
import ses from 'node-ses';
import config from '../../config';

const client = ses.createClient(config.email);

export default Promise.promisify(client.sendEmail, { context: client });
