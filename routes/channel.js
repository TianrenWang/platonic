const express = require('express');
const router = express.Router();
const passport = require('passport');
const Channel = require('../models/channel');

// get all channels and categorize them by creation
router.get('/', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  Channel.find({}, (err, channels) => {
    if (err || channels == null) {
      response.success = false;
      response.msg = "There was an error on getting the channels";
      res.json(response);
    } else {
      response.msg = "Channels retrieved successfully";
      response.channels = channels;
      res.json(response);
    }
  });
});

// post channel
router.post('/', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  console.log("Posting conversation")
  let response = {success: true};
  Channel.addChannel(req.body, (err, channel) => {
    if (err) {
      response.success = false;
      response.msg = err;
      res.json(response);
    } else {
      response.msg = "Channel saved successfully";
      response.channel = channel;
      res.json(response);
    }
  });
});

// delete channel
router.delete('/', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  Channel.deleteOne({_id: req.query._id}, (err) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error deleting the channel";
      res.json(response);
    } else {
      response.msg = "Channel deleted successfully";
      res.json(response);
    }
  });
});

module.exports = router;
