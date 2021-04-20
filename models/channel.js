const mongoose = require('mongoose');
const ChatRequest = require('./chat_request');
const Membership = require('./membership');
const Subscription = require('./subscription');
const Notification = require('./notification');
const async = require('async');

// channel schema
const ChannelSchema = mongoose.Schema({
  completedChats: {
    type: Number,
    default: 0
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: null
  },
  debate: {
    type: Boolean,
    default: false
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
    index: true
  },
  channelType: {
    type: String,
    required: true
  }
});

ChannelSchema.statics.addChannel = (channel, callback) => {
  new Channel(channel).save((save_err, channel) => {
    if (save_err) {
      callback(save_err, channel);
    } else {
      // if channel document was saved successfully, populate the creators field
      Channel.populate(channel, {path: "creator", select: 'username email'}, (populate_err, populatedChannel) => {
        if (populate_err) {
          callback(populate_err, populatedChannel);
        } else {
          // if the populating was successful, become a member and subscriber of this channel
          new Subscription({
            user: populatedChannel.creator._id,
            channel: populatedChannel._id
          }).save();
          new Membership({
            user: populatedChannel.creator._id,
            channel: populatedChannel._id
          }).save();
          callback(null, populatedChannel);
        }
      })
    }
  });
};

ChannelSchema.pre('deleteOne', function(next){
  Membership.deleteMany({channel: this._conditions._id}).exec();
  ChatRequest.deleteMany({channel: this._conditions._id}).exec();
  Subscription.deleteMany({channel: this._conditions._id}).exec();
  Notification.Notification.deleteMany({channel: this._conditions._id}).exec();
  next();
});

ChannelSchema.statics.getChannelInfo = (channelId, callback) => {
  Channel.findById(channelId).populate("creator", '-password -__v').exec((get_channel_err, channel) => {
    if (get_channel_err || channel == null) {
      callback(get_channel_err, channel);
    } else {
      let calls = [];
      let response = { channel: channel };

      calls.push(function(async_callback) {
        ChatRequest.find({channel: channelId, acceptor: null})
        .sort({created: -1})
        .populate("user", '-password -__v')
        .exec(function(err, result) {
          if (err)
            return callback(err);
          async_callback(null, result);
        });
      });
      
      [Membership, Subscription].forEach(function(collection){
        calls.push(function(async_callback) {
          collection.find({channel: channelId}).populate("user", '-password -__v').exec(function(err, result) {
            if (err)
              return callback(err);
            async_callback(null, result);
          });
        });
      });

      async.parallel(calls, function(err, result) {
        if (err){
          callback(err);
        } else {
          response.chat_requests = result[0];
          response.memberships = result[1];
          response.subscriptions = result[2];
          callback(null, response);
        }
      });
    }
  })
};

ChannelSchema.statics.getRelationshipsOfUser = (channelId, userId, callback) => {
  let calls = [];
  let response = {};

  calls.push(function(async_callback) {
    ChatRequest.findOne({channel: channelId, acceptor: null, user: userId})
    .populate("user", '-password -__v')
    .populate("channel")
    .exec(function(err, result) {
      if (err)
        return callback(err);
      async_callback(null, result);
    });
  });
  
  [Membership, Subscription].forEach(function(collection){
    calls.push(function(async_callback) {
      collection.findOne({channel: channelId, user: userId})
      .populate("user", '-password -__v')
      .populate("channel")
      .exec(function(err, result) {
        if (err)
          return callback(err);
        async_callback(null, result);
      });
    });
  });

  async.parallel(calls, function(err, result) {
    if (err){
      callback(err);
    } else {
      response.chat_request = result[0];
      response.membership = result[1];
      response.subscription = result[2];
      callback(null, response);
    }
  });
};

const Channel = mongoose.model('Channel', ChannelSchema);

module.exports = Channel;
