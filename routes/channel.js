const express = require('express');
const router = express.Router();
const passport = require('passport');
const Channel = require('../models/channel');

// get all channels and categorize them by creation
router.get('/', (req, res, next) => {
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

// get a single channel
router.get('/channel', (req, res, next) => {
  let response = {success: true};
  Channel.getChannelInfo(req.query.channelId, (err, channelInfo) => {
    if (err || channelInfo == null) {
      response.success = false;
      response.err = err;
      res.json(response);
    } else {
      response.msg = "Channel retrieved successfully";
      response.channel = channelInfo.channel;
      response.members = channelInfo.members;
      res.json(response);
    }
  });
});

// post channel
router.post('/', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  console.log("Posting channel")
  let response = {success: true};
  Channel.addChannel(req.body, (err, channel) => {
    if (err) {
      response.success = false;
      response.msg = err;
      res.json(response);
    } else {
      Channel.populate(channel, {path: "creator", select: 'username email'}, (err, populatedChannel) => {
        if (err) {
          response.success = false;
          response.msg = err;
          res.json(response);
        } else {
          response.msg = "Channel saved successfully";
          response.channel = populatedChannel;
          res.json(response);
        }
      })
    }
  });
});

// delete channel
router.delete('/', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  if (req.user._id !== req.query.creatorId){
    response.success = false;
    response.msg = "Non-owner attempted to delete channel";
    res.json(response);
  } else {
    Channel.deleteChannel(req.query.channelId, (err) => {
      if (err) {
        response.success = false;
        response.msg = "There was an error deleting the channel";
        res.json(response);
      } else {
        response.msg = "Channel deleted successfully";
        res.json(response);
      }
    });
  }
});

module.exports = router;
