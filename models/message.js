const mongoose = require('mongoose');

// message schema
const BaseMessageSchema = mongoose.Schema({
  created: {
    type: Date,
    required: true
  },
  from: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true
  },
  dialogue: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Dialogue",
    index: true
  },
  attributes: {
    type: Object,
    default: {}
  }
});

const BaseMessage = mongoose.model('BaseMessage', BaseMessageSchema);

const options = { discriminatorKey: 'kind' };
const Comment = BaseMessage.discriminator(
  'Comment',
  new mongoose.Schema({}, options)
);
const Message = BaseMessage.discriminator(
  'Message',
  new mongoose.Schema({}, options)
);

exports.Message = Message;
exports.Comment = Comment;
