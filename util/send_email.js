const config = require('../config');

//Instructions:
// use test file send_email_test.js file (and follow the instructions on that file)

"use strict";
const nodemailer = require("nodemailer");

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.email.email,
    pass: config.email.password
  },
});

// send mail with defined transport object
module.exports = function sendEmail(to, subject, message) {
  const mailOptions = {
      from: config.email.email,
      bcc: to,
      subject,
      text: message,
  };
  transporter.sendMail(mailOptions, (error) => {
      if (error) {
          console.log(error);
      }
  });
};

