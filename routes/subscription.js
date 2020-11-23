const express = require('express');
const router = express.Router();
const passport = require('passport');
const Subscription = require('../models/subscription');

// post subscription
router.post('/subscribe', (req, res, next) => {
    console.log("Posting Subscription")
    let response = {success: true};
    Subscription.addSubscription(req.body, (err, channel) => {
      let newSubscription = new Subscription({
        subscribeeName: "amin",
        subscriberName: "amin1",
        subscriberEmail: "amin2"
      });

      response.success = true;
      response.msg = 'User registered successfuly';
      response.user = {
        id: "amin3",
        username: "amin4",
      };

      console.log('[%s] registered successfuly', "amin5");
      res.json(response);

    });
});

module.exports = router ;
