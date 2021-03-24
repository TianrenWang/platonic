const mongoose = require('mongoose');
const Message = require('./message');
const Subscription = require('./subscription');
const { Notification, NEW_DIALOGUE } = require('./notification');

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
  new Dialogue(dialogue).save((error, saved_dialogue) => {
    if (error){
      callback(error, null);
    } else {
      for (i = 0; i < messages.length; i++) {
        messages[i].dialogue = saved_dialogue._id;
        messages[i].from = new mongoose.Types.ObjectId(messages[i].from);
      }
      Message.collection.insertMany(messages, {ordered: true, validate: true}, (message_err, _) => {
        if (message_err){
          callback(message_err);
        } else {
          callback(null, saved_dialogue);
        }
      });
      Subscription.find({channel: dialogue.channel}, (err, subscriptions) => {
        let notifications = [];
        for (let index = 0; index < subscriptions.length; index++) {
          notifications.push(new Notification({
            type: NEW_DIALOGUE,
            user: subscriptions[index].user,
            channel: dialogue.channel,
            dialogue: saved_dialogue._id
          }));
        }
        Notification.collection.insertMany(notifications, {validate: true});
      });
    }
  });
};

DialogueSchema.statics.getDialogueById = (dialogueId, view, callback) => {
  let update = {}
  if (view === 'true'){
    update = {$inc : {'views' : 1}};
  }
  Dialogue.findByIdAndUpdate(dialogueId, update).populate({
    path: 'participants',			
    model: 'User',
    select: '-password -__v'
  }).exec((err, dialogue) => {
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
