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
    required: true
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
          // if the populating was successful, create a membership
          let membership = { user: populatedChannel.creator._id, channel: populatedChannel._id }
          new Membership(membership).save((member_err, membership) => {
            callback(member_err, populatedChannel);
          })
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
})

ChannelSchema.statics.joinChannel = (channelId, userId, callback) => {
  new Membership({channel: channelId, user: userId}).save(callback);
};

ChannelSchema.statics.getChannelInfo = (channelId, callback) => {
  Channel.findById(channelId).populate("creator", '-password -__v').exec((get_channel_err, channel) => {
    if (get_channel_err || channel == null) {
      callback(get_channel_err, channel);
    } else {
      let calls = [];
      let response = { channel: channel };
      [ChatRequest, Membership, Subscription].forEach(function(collection){
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

const Channel = mongoose.model('Channel', ChannelSchema);

module.exports = Channel;
