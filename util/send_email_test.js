//Instructions:
//run:
//sr='' pwd='' rc='' nano send_email_test.js

const sendEmail =require('./send_email');

const receiver_email = process.env.rc;
sendEmail(receiver_email, 'sample subject', 'sample message');
