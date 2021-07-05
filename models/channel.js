const mongoose = require('mongoose');
const ChatRequest = require('./chat_request');
const Membership = require('./membership');
const Subscription = require('./subscription');
const Notification = require('./notification');
const config = require('../config');
const slugify = require('slugify');

// channel schema
const ChannelSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
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
    ref: "User"
  },
  channelType: {
    type: String,
    required: true
  },
  photoUrl: {
    type: String,
    default: null
  }
}, { toJSON: { virtuals: true } });

ChannelSchema.virtual('numMemberships', {
  ref: 'Membership',
  localField: '_id',
  foreignField: 'channel',
  count: true
});

ChannelSchema.virtual('numSubscriptions', {
  ref: 'Subscription',
  localField: '_id',
  foreignField: 'channel',
  count: true
});

ChannelSchema.virtual('numDialogues', {
  ref: 'Dialogue',
  localField: '_id',
  foreignField: 'channel',
  count: true
});

ChannelSchema.index({slug: 1, creator: 1});
ChannelSchema.statics.addChannel = (channel, callback) => {
  let slug = slugify(channel.name, config.slugify);
  new Channel({...channel, slug: slug}).save((save_err, channel) => {
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

ChannelSchema.statics.getChannelInfo = (channelId, userId, callback) => {
  let response = {};
  Channel.findById(channelId)
  .populate("creator", config.userPropsToIgnore)
  .populate('numMemberships')
  .populate('numSubscriptions')
  .populate('numDialogues')
  .then((channel) => {
    response.channel = channel;
    let calls = [];
    calls.push(
      ChatRequest.find({channel: channelId, acceptor: null})
      .sort({created: -1})
      .populate("user", config.userPropsToIgnore)
      .then((result) => {
        result.forEach(request => {
          request.channel = channel;
        })
        return result;
      })
    );

    [Membership, Subscription].forEach(function(collection){
      calls.push(
        collection.find({channel: channelId})
        .populate("user", config.userPropsToIgnore)
        .then((result) => {
          result.forEach(relationship => {
            relationship.channel = channel;
          })
          return result;
        })
      )
    });

    if (userId) {
      calls.push(
        ChatRequest.findOne({channel: channelId, acceptor: null, user: userId})
        .populate("user", config.userPropsToIgnore)
        .populate("channel")
      );

      [Membership, Subscription].forEach(function(collection){
        calls.push(
          collection.findOne({channel: channelId, user: userId})
          .populate("user", config.userPropsToIgnore)
          .populate("channel")
        );
      });
    }
    return Promise.all(calls);
  })
  .then((result) => {
    response.chat_requests = result[0];
    response.memberships = result[1];
    response.subscriptions = result[2];
    if (userId) {
      response.relationships = {
        chat_request: result[3],
        membership: result[4],
        subscription: result[5]
      }
    }
    callback(null, response);
  })
  .catch(error => {
    callback(error);
  })
};

const Channel = mongoose.model('Channel', ChannelSchema);

module.exports = Channel;
