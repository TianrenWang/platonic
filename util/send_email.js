//Instructions:
// use test file send_email_test.js file (and follow the instructions on that file)

"use strict";
const nodemailer = require("nodemailer");
const sr = process.env.sr; //sending email
const pwd = process.env.pwd; //sending email password

 // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    secure: false, // true for 465, false for other ports
    auth: {
      user: sr,
      pass: pwd,
    },
  });

console.log("Message sent. ");

// send mail with defined transport object
module.exports = function sendEmail(to, subject, message) {
    const mailOptions = {
        from: sr,
        to,
        subject,
        html: message,
    };
    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            console.log(error);
        }
    });
};

