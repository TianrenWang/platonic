const mongoose = require('mongoose');

// message schema
const MessageSchema = mongoose.Schema({
  created: {
    type: Date,
    required: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
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

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;
