const express = require('express');
const router = express.Router();
const passport = require('passport');
const config = require('../config');
const User = require('../models/user');

// get public key and whether user already subscribed to push notification
router.get('/', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  let response = { success: true, publicKey: config.webpush.publicKey };
  res.json(response);
});

// add push notification certificate to user
router.patch('/', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  let response = { success: true };
  User.findByIdAndUpdate(req.user._id, req.body, (error) => {
    if (error){
      response.success = false;
      response.error = error.message;
    } else {
      res.json(response);
    }
  })
});

module.exports = router;
