const mongoose = require('mongoose');
const ChatRequest = require('./chat_request');
const Membership = require('./membership');

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
  let channelObj = new Channel(channel);

  // save the channel document first
  channelObj.save((save_err, channel) => {
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

ChannelSchema.statics.deleteChannel = (channelId, callback) => {
  Channel.findByIdAndDelete(channelId, (channel_err) => {
    if (channel_err) {
      callback(channel_err);
    } else {
      Membership.deleteMany({channel: channelId}, (membership_err) => {
        if (membership_err) {
          callback(membership_err);
        } else {
          ChatRequest.deleteMany({channel: channelId}, (request_err) => {
            callback(request_err);
          })
        }
      })
    }
  });
};

ChannelSchema.statics.joinChannel = (channelId, userId, callback) => {
  new Membership({channel: channelId, user: userId}).save(callback);
};

ChannelSchema.statics.getChannelInfo = (channelId, callback) => {
  Channel.findById(channelId).populate("creator", '-password').exec((get_channel_err, channel) => {
    if (get_channel_err || channel == null) {
      callback(get_channel_err, channel);
    } else {
      Membership.find({ channel: channel._id })
        .populate("user", "-password")
        .exec((get_members_err, members) => {
          if (get_members_err){
            callback(get_members_err, members);
          }
          else {
            for (let index = 0; index < members.length; index++) {
              members[index] = members[index].user;
            }
            ChatRequest.find({ channel: channel._id })
              .populate("user", "-password")
              .exec((get_requests_err, requesters) => {
                if (get_requests_err){
                  callback(get_members_err, requesters);
                }
                else {
                  for (let index = 0; index < requesters.length; index++) {
                    requesters[index] = requesters[index].user;
                  }
                  let response = {channel: channel, members: members, requesters: requesters};
                  callback(null, response);
                }
              });
          }
      });
    }
  });
};

const Channel = mongoose.model('Channel', ChannelSchema);

module.exports = Channel;
