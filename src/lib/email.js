import config from '../../config';

import AWS from 'aws-sdk';
import Promise from 'bluebird';
import nodemailer from 'nodemailer';
import sesTransport from 'nodemailer-ses-transport';

const ses = nodemailer.createTransport(sesTransport({
  ses: new AWS.SES(config.email),
}));

export default Promise.promisify(ses.sendMail, {context: ses});
