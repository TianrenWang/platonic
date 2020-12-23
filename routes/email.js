const express = require('express');
const router = express.Router();
const passport = require('passport');
const Subscription = require('../models/subscription');
const sendEmail = require('../util/send_email');
const config = require('../config/index');

// Send email to all users subscribed to the entity as indicated by the request's body
router.post('/', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  console.log("Posting notification email")
  let response = {success: true};
  let emails = [];
  Subscription.find({subscribedName: req.body.subscribedName}, (err, subscriptions) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error sending the notification email";
      res.json(response);
    } else {
      for(i = 0; i<subscriptions.length; i++){
        emails.push(subscriptions[i].subscriberEmail);
      }
      if (emails.length > 0){
        let emails_string = emails.join(",");
        let message = "Hello!\n\n" +
        req.body.subscribedName + " just created a new conversation, follow this link to see the conversation: " + req.body.conversationLink +
        "\n\nRegards\n\nPlatonic";
  
        sendEmail(
          emails_string,
          "New Conversation at " + req.body.subscribedName,
          message);
        
        response.msg = "Sent user subscription update email successfully";
        response.emails = emails;
        res.json(response);
      } else {
        response.success = false;
        response.msg = "There were no subscribers";
        res.json(response);
      }
    }
  });
});

module.exports = router;