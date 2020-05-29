require('dotenv').config({ path: 'variables.env' });
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const msg = {
  to: 'jordi.nieuwenburg@ogd.nl',
  from: 'jordi.nieuwenburg@ogd.nl',
  subject: 'Shit yeah!!!!',
  text: 'just because!!',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>'
};
sgMail.send(msg);