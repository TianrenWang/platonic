const mongoose = require('mongoose');
const ChatRequest = require('./chat_request');
const Membership = require('./membership');
const Subscription = require('./subscription');
const channel_aggregation = require('./channel_aggregate.json');

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
    ref: "User"
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
  Notification.deleteMany({channel: this._conditions._id}).exec();
  next();
})

ChannelSchema.statics.joinChannel = (channelId, userId, callback) => {
  new Membership({channel: channelId, user: userId}).save(callback);
};

ChannelSchema.statics.getChannelInfo = (channelId, callback) => {
  Channel.findById(channelId).populate("creator", '-password').exec((get_channel_err, channel) => {
    if (get_channel_err || channel == null) {
      callback(get_channel_err, channel);
    } else {
      Channel.aggregate([
        { "$match": {
          "_id": mongoose.Types.ObjectId(channelId) } }
        ].concat(channel_aggregation), (error, result) => {
        let response = {
          channel: channel,
          members: result[0].memberships,
          requesters: result[0].chatrequests,
          subscriptions: result[0].subscriptions
        };
        callback(null, response);
      });
    }
  })
};

const Channel = mongoose.model('Channel', ChannelSchema);

module.exports = Channel;
