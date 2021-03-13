const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const passport = require('passport');
const Channel = require('../models/channel');
const ChatRequest = require('../models/chat_request');
const Membership = require('../models/membership');
const getAllChannelsByUser = require('../models/channel_user').getAllChannelsByUser;

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
      Object.assign(response, channelInfo);
      res.json(response);
    }
  });
});

// get memberships of a user
router.get('/memberships', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  getAllChannelsByUser(Membership, req.user._id, (err, channels) => {
    if (err || channels == null) {
      response.success = false;
      response.err = err;
      res.json(response);
    } else {
      response.msg = "Member channels retrieved successfully";
      response.channels = channels;
      res.json(response);
    }
  });
});

// post channel
router.post('/', passport.authenticate("jwt", {session: false}), (req, res, next) => {
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

// patch channel
router.patch('/', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  Channel.findByIdAndUpdate(req.query.channelId, req.body, (err, channel) => {
    if (err) {
      response.success = false;
      response.msg = err;
      res.json(response);
    } else {
      response.msg = "Channel updated successfully";
      response.channel = channel;
      res.json(response);
    }
  });
});

// join channel
router.post('/joinChannel', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  console.log("Posting a membership")
  let response = {success: true};
  Channel.joinChannel(req.query.channelId, req.user._id, (err, membership) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      response.msg = "User successfully joined channel";
      response.membership = membership;
      res.json(response);
    }
  });
});

// request chat at channel
router.post('/requestChat', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  console.log("Creating a chat request")
  let response = {success: true};
  ChatRequest.createChatRequest(req.user._id, req.query.channelId, null, (err, request) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      response.chat_request = request;
      response.msg = "User successfully requested for chat";
      res.json(response);
    }
  });
});

// cancel chat request
router.delete('/cancelRequest', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  ChatRequest.findByIdAndDelete(req.query.requestId, (err) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error deleting the chat request";
      res.json(response);
    } else {
      response.msg = "Chat request deleted successfully";
      res.json(response);
    }
  });
});

// accept chat request
router.patch('/acceptRequest', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  let acceptor = new mongoose.Types.ObjectId(req.user._id);
  ChatRequest.findOneAndUpdate({user: req.query.userId, channel: req.query.channelId}, {acceptor: acceptor}, (err) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error accepting the chat request";
      res.json(response);
    } else {
      response.msg = "Chat request accepted successfully";
      res.json(response);
    }
  });
});

// delete membership (leave the channel)
router.delete('/leaveChannel', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  Membership.deleteOne({user: req.user._id, channel: req.query.channelId}, (err) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error deleting the membership";
      res.json(response);
    } else {
      response.msg = "Membership deleted successfully";
      res.json(response);
    }
  });
});

// delete channel
router.delete('/', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  Channel.deleteOne({_id: req.query.channelId, creator: req.user._id}, (err) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      response.msg = "Channel deleted successfully";
      res.json(response);
    }
  });
});

module.exports = router;
