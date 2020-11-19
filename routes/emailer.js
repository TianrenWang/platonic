const express = require('express');
const router = express.Router();
const passport = require('passport');
const Message = require('../util/send_email');


//TODO: Subscription model
//TODO: requester const express = require('express');
const router = express.Router();
const passport = require('passport');
const Message = require('../models/message');

//subscription_item+subject will look similar to "BirdWatchers channel  update 3542"
router.post('/subscription', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  console.log("Posting subscription")
  let response = {success: true};
  Subscription.activateEmailer(subscriber: req.body.subscriber, subscription_item: req.body.subscription_item,
subject:req.body.subject, message:req.body.message	(err, subscription) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error sending the notification email";
      res.json(response);
    } else {
      sendEmail(subscriber, subscription_item+subject, message);
      response.msg = "Notification email sent successfully";
      response.subscription = subscription;
      res.json(response);
    }
  });
});
