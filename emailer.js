"use strict";
const nodemailer = require("nodemailer");
const sr = process.env.sr;
const pwd = process.env.pwd;
const rc = process.env.rc;
const sjt = process.env.sjt;
const msg = process.env.msg;
// async..await is not allowed in global scope, must use a wrapper
async function main() {

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    secure: false, // true for 465, false for other ports
    auth: {
      user: sr,
      pass: pwd,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: sr, // sender address
    to: rc, // list of receivers
    subject: sjt, // Subject line
    text: msg, // plain text body
   // html: ht, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

main().catch(console.error);
