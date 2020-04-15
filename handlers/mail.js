const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

transport.sendMail({
  from: 'Jord New <jrobertn@gmail.com>',
  to: 'duder@example.com',
  subject: 'Just checking stuff out!',
  html: 'Man, that is a <strong>nice</strong> hat you have there',
  text: 'Some more **text**'
});