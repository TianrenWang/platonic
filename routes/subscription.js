const express = require('express');
const router = express.Router();
const passport = require('passport');
const Subscription = require('../models/subscription');
const channelIdNotSpecifiedError = new Error("'channelId' query parameter not specified in request");

// fetch all subscribed channels of a suser
router.get('/', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  Subscription.find({user: req.user._id}).populate({
    path: 'channel',			
    populate: { path: 'creator', model: 'User', select: '-password -__v'  }
  }).exec((err, subscriptions) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      response.subscriptions = subscriptions;
      res.json(response);
    }
  });
});

// create a new subscription
router.post('/', passport.authenticate("jwt", {session: false}), (req, res, next) => {
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
  let response = {success: true};
  Subscription.findByIdAndDelete(req.query.subscriptionId, (err) => {
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
