const express = require('express');
const router = express.Router();
const passport = require('passport');
const Channel = require('../models/channel');
const ChatRequest = require('../models/chat_request');
const Membership = require('../models/membership');
const config = require('../config');
const { uploadChannelPhoto } = require('../config/aws');
const no_fail_authenticate = require("../config/passport").nofail_authentication;

// get all channels and categorize them by creation
router.get('/', (req, res, next) => {
  let response = {success: true};
  Channel.find({})
  .populate({ path: 'creator', model: 'User', select: config.userPropsToIgnore })
  .populate('numMemberships')
  .populate('numSubscriptions')
  .populate('numDialogues')
  .exec((err, channels) => {
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
router.get('/memberships', (req, res, next) => {
  let response = {success: true};
  Membership.find({user: req.query.userId}).populate({
    path: 'channel',
    populate: [
      { path: 'creator', model: 'User', select: config.userPropsToIgnore  },
      { path: 'numMemberships' },
      { path: 'numSubscriptions' },
      { path: 'numDialogues' }
    ]
  }).exec((err, memberships) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      response.memberships = memberships;
      res.json(response);
    }
  });
});

// get the membership, subscription, and oustanding chat request for a user in a channel
router.get('/relationships', no_fail_authenticate, (req, res, next) => {
  let response = {success: true};
  if (!req.user) {
    response.success = false;
    response.error = new Error("User is not logged in.");
    res.json(response);
    return;
  }
  Channel.getRelationshipsOfUser(req.query.channelId, req.user._id, (err, relations) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      Object.assign(response, relations);
      res.json(response);
    }
  });
});

// get channels created by a user
router.get('/channels', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  Channel.find({creator: req.user._id})
  .populate('numMemberships')
  .populate('numSubscriptions')
  .populate('numDialogues')
  .exec((err, channels) => {
    if (err || channels == null) {
      response.success = false;
      response.message = err.message;
      res.json(response);
    } else {
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

// update channel photo
router.patch('/updatePhoto',
  passport.authenticate('jwt', { session: false }),
  uploadChannelPhoto.single("photoFile"),
  (req, res, next) => {
  let response = { success: true };
  Channel.findByIdAndUpdate(req.query.channelId, {photoUrl: req.file.location}, {new: true})
  .populate("creator", config.userPropsToIgnore).exec((error, channel) => {
    if (error) {
      response.success = false;
      response.error = error;
      res.json(response);
    } else {
      response.channel = channel;
      res.json(response);
    }
  });
});

// join channel
router.post('/joinChannel', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  console.log("Posting a membership")
  let response = {success: true};
  let membership = new Membership({user: req.user._id, channel: req.query.channelId});
  membership.save();
  membership.populate({
    path: 'channel',			
    populate: { path: 'creator', model: 'User', select: config.userPropsToIgnore  }
  }, (err, chan_membership) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
      return;
    }
    chan_membership.populate({ path: 'user', model: 'User', select: config.userPropsToIgnore }, (err, full_membership) => {
      if (err) {
        response.success = false;
        response.error = err;
        res.json(response);
      } else {
        response.membership = full_membership;
        res.json(response);
      }
    });
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
  ChatRequest.deleteOne({_id: req.query.requestId}, (err) => {
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
  ChatRequest.acceptChatRequest(req.query.requestId, req.user._id, (err, _) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      response.message = "Chat request accepted successfully";
      res.json(response);
    }
  });
});

// delete membership (leave the channel)
router.delete('/leaveChannel', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  Membership.findByIdAndDelete(req.query.membershipId, (err) => {
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
