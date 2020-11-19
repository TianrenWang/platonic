const express = require('express');
const router = express.Router();
const passport = require('passport');
const Message = require('../models/send_email');

const sendEmail =require('../util/ send_email');


//email subject line should be built similarly to "Mychannel notificatio update 345"
router.post('/send_email', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  console.log("Posting notification email")
  let response = {success: true};
  Subscription.find(subscriber: req.body.subscriber, subscription_item: req.body.subscription_item,
subject: req.body.subject, message: req.body.message (err, conversation) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error sending the notification email";
      res.json(response);
    } else {
	sendEmail(subscriber, subject, message);
      response.msg = "Sent user subscription update email successfully for subscription items: " 
+subscription_item;
      response.subscriptions = subscriptions;
      res.json(response);
    }
  });
});
