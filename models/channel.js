const mongoose = require('mongoose');

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
  maxTime: {
    type: Number,
    required: true
  },
  creatorName: {
    type: String,
    required: true
  },
  channelType: {
    type: String,
    required: true
  }
});

ChannelSchema.statics.addChannel = (channel, callback) => {
  let channelObj = new Channel(channel);
  channelObj.save(callback);
};

const Channel = mongoose.model('Channel', ChannelSchema);

module.exports = Channel;
