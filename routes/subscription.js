const express = require('express');
const router = express.Router();
const passport = require('passport');
const Subscription = require('../models/subscription');
const getAllChannelsByUser = require('../models/channel_user').getAllChannelsByUser;
const userIdNotSpecifiedError = new Error("'userId' query parameter not specified in request");
const channelIdNotSpecifiedError = new Error("'channelId' query parameter not specified in request");

// fetch all subscribed channels of a suser
router.get('/', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  console.log("Subscribing")
  let response = {success: true};
  getAllChannelsByUser(Subscription, req.user._id, (err, subscribed_channels) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      response.msg = "Successfully fetched subscribed channels";
      response.channels = subscribed_channels;
      res.json(response);
    }
  });
});

// create a new subscription
router.post('/', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  console.log("Subscribing")
  let response = {success: true};
  if (!req.query.channelId){
    response.success = false;
    response.error = channelIdNotSpecifiedError;
    res.json(response);
    return;
  }
  Subscription.subscribeChannel(req.query.channelId, req.user._id, (err, subscription) => {
    if (err){
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      response.subscription = subscription;
      response.msg = "Successfully created subscription";
      res.json(response);
    }
  });
});

// delete a subscription
router.delete('/', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  console.log("Deleting a subscription")
  let response = {success: true};
  Subscription.deleteOne({user: req.user._id, channel: req.query.channelId}, (err) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      response.msg = "Successfully deleted subscription";
      res.json(response);
    }
  });
});

module.exports = router ;
