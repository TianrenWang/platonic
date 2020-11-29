const express = require('express');
const router = express.Router();
const passport = require('passport');
const Subscription = require('../models/subscription');

const sendEmail =require('../util/send_email');
var emails ="";

//Find the channel or user that has update
//Gather all the emails that should notified of the update ie: new conversation
router.post('/send_email', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  console.log("Posting notification email")
  let response = {success: true};
  Subscription.find({subscribedName: req.body.subscribedName}, (err, subscriptions) => {
  if (err) {
    response.success = false;
    response.msg = "There was an error sending the notification email";
    res.json(response);
  }else{
  for(i = 0; i<subscriptions.length; i++){
    emails += subscriptions[i].subscriberEmail+",";
  }

	//remove the last comma from the list of multiple emails
	emails = emails.slice(0,-1);
	
	//use the util to send email
	//TODO: add linka after testing
	sendEmail(emails, subscribed + " just made a new conversation", "Hello! "
+subscribed+ "just created a new conversation, follow this link to see the conversation");
      
	response.msg = "Sent user subscription update email successfully: "+subscribed;
      	response.subscriptions = subscriptions;
      	res.json(response);
   	}
  });
});
