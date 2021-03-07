const mongoose = require('mongoose');
const Message = require('./message');
const { Notification } = require('./notification');

function arrayLength(val) {
  return val.length > 1;
}

// conversation schema
const DialogueSchema = mongoose.Schema({
  participants:{
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    validate: [arrayLength, '{PATH} has less than 2 participants']
  },
  title: {
    type: String,
    required: true
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Channel"
  },
  description: {
    type: String,
    default: ""
  },
  views: {
    type: Number,
    default: 0
  }
});

DialogueSchema.statics.saveDialogue = (dialogue, messages, callback) => {
  new Dialogue(dialogue).save((error, dialogue) => {
    if (error){
      callback(error, null);
    } else {
      for (i = 0; i < messages.length; i++) {
        messages[i]["dialogue"] = convoID;
      }
      Message.collection.insertMany(messages, {ordered: true});
      callback(null, dialogue);
    }
  });
};

DialogueSchema.statics.getDialogueById = (dialogueId, view, callback) => {
  let update = {}
  if (view === true){
    update = {$inc : {'views' : 1}};
  }
  Dialogue.findByIdAndUpdate(dialogueId, update, (err, dialogue) => {
    if (err) {
      let error = "There was an error on getting the dialogue with id: " + dialogueId;
      return callback(error);
    } else {
      Message.find({dialogue: dialogueId}).populate("from", "-password").exec((err, messages) => {
        if (err) {
          return callback(err);
        } else {
          let sortedMessages = messages.sort(function(a,b){
            return new Date(a.created) - new Date(b.created);
          });
          return callback(null, {
            dialogue: dialogue,
            messages: sortedMessages
          });
        }
      });
    }
  });
};

DialogueSchema.pre('deleteOne', function(next){
  Message.deleteMany({dialogue: this._conditions._id}).exec();
  Notification.deleteMany({dialogue: this._conditions._id}).exec();
  next();
})

const Dialogue = mongoose.model('Dialogue', DialogueSchema);
module.exports = Dialogue;
