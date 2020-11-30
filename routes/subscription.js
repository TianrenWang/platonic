const express = require('express');
const router = express.Router();
const passport = require('passport');
const Subscription = require('../models/subscription');

// fetch a subscription
router.get('/', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  console.log("Subscribing")
  let response = {success: true};
  Subscription.find({subscriberName: req.query.subscriberName}, (err, subscriptions) => {
    if (err) {
      response.success = false;
      response.msg = err;
      res.json(response);
    } else {
      response.msg = "Successfully fetched subscriptions";
      response.subscriptions = subscriptions;
      res.json(response);
    }
  });
});

// create a new subscription
router.post('/', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  console.log("Subscribing")
  let response = {success: true};
  Subscription.addSubscription(req.body, (err, subscription) => {
    if (err) {
      response.success = false;
      response.msg = err;
      res.json(response);
    } else {
      response.msg = "Successfully created subscription";
      response.subscription = subscription;
      res.json(response);
    }
  });
});

// delete a subscription
router.delete('/', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  console.log("Deleting a subscription")
  let response = {success: true};
  Subscription.deleteOne(req.query, (err, subscription) => {
    if (err) {
      response.success = false;
      response.msg = err;
      res.json(response);
    } else {
      response.msg = "Successfully deleted subscription";
      response.subscription = subscription;
      res.json(response);
    }
  });
});

module.exports = router ;
