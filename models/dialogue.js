const mongoose = require('mongoose');
const Channel = require('./channel');
const Message = require('./message');
const Subscription = require('./subscription');
const { Notification, NEW_DIALOGUE } = require('./notification');
const async = require('async');
const { Reaction, reactionTypes } = require('./reaction');
const config = require('../config');
const webpush = require('web-push');

webpush.setVapidDetails(
  "mailto:" + config.email.email,
  config.webpush.publicKey,
  config.webpush.privateKey
);

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
  },
  created: {
    type: Date,
    default: function(){
        return new Date();
    }
  },
  published: {
    type: Boolean,
    default: false
  }
});

DialogueSchema.statics.saveDialogue = (dialogue, messages, callback) => {
  let newDialogue = new Dialogue(dialogue);
  let completeDialogue;
  let notifications = [];

  // Save the dialogue
  newDialogue.save().then(() => {
    return Dialogue.populate(newDialogue, [
      {path: 'participants', model: 'User', select: config.userPropsToIgnore},
      {path: 'channel', populate: {path: 'creator', model: 'User', select: config.userPropsToIgnore}}
    ]);
  })

  // Save the messages
  .then(result => {
    completeDialogue = result;
    for (i = 0; i < messages.length; i++) {
      messages[i].dialogue = completeDialogue._id;
      messages[i].from = new mongoose.Types.ObjectId(messages[i].from);
    }
    return Message.collection.insertMany(messages, {ordered: true, validate: true});
  })
  
  // Successfully saved the dialogue
  .then(() => {
    callback(null, completeDialogue);
  })

  // deal with all errors that may occur while saving dialogue
  .catch(error => {
    console.error("Error saving dialogue:", error.message);
    callback(error, null);
  })
  
  // fetch all subscriptions for the channel where dialogue happened
  .then(() => {
    return Subscription.find({channel: dialogue.channel});
  })
  
  // Create notification documents based on subscriptions
  .then(subscriptions => {
    for (let index = 0; index < subscriptions.length; index++) {
      notifications.push(new Notification({
        type: NEW_DIALOGUE,
        user: subscriptions[index].user,
        channel: dialogue.channel,
        dialogue: completeDialogue._id
      }));
    }
    return Notification.collection.insertMany(notifications, {validate: true});
  })
  
  // Get each subscribed user's push key
  .then(() => {
    return Notification.populate(notifications, {path: "user", select: '-password'});
  })

  // Send push notification
  .then((populated_notifications) => {
    let push_notifications = [];
    for (let index = 0; index < populated_notifications.length; index++) {
      let notification = populated_notifications[index];
      let webpush_sub = notification.user.ng_webpush;
      notification.channel = completeDialogue.channel;
      notification.dialogue = completeDialogue;
      notification.user = notification.user._id;
      if (webpush_sub){
        push_notifications.push(webpush.sendNotification(webpush_sub, JSON.stringify(notification)));
      }
    }
    return Promise.all(push_notifications);
  })
  .then(() => {
    console.log("Pushed notifications successfully");
  })
  .catch(error => {
    console.error("Failed to push notifications:", error.message);
  })
};

DialogueSchema.statics.getDialogueById = (dialogueId, view, callback) => {
  let update = {}
  if (view === 'true'){
    update = {$inc : {'views' : 1}};
  }

  let calls = [];

  calls.push(function(async_callback) {
    Dialogue.findByIdAndUpdate(dialogueId, update, {new: true}).populate({
      path: 'participants',			
      model: 'User',
      select: config.userPropsToIgnore
    }).exec((err, dialogue) => {
      if (err)
        return callback(err);
      async_callback(null, dialogue);
    });
  });
  
  calls.push(function(async_callback) {
    Message.find({dialogue: dialogueId}).populate("from", "-password").exec((err, messages) => {
      if (err)
        return callback(err);
      async_callback(null, messages);
    });
  });

  calls.push(function(async_callback) {
    Reaction.countDocuments({dialogue: dialogueId, type: reactionTypes.LIKE}, (err, likes) => {
      if (err)
        return callback(err);
      async_callback(null, likes);
    });
  });

  async.parallel(calls, function(err, result) {
    if (err){
      callback(err);
    } else {
      callback(null, {
        dialogue: result[0],
        messages: result[1].sort(function(a,b){
          return new Date(a.created) - new Date(b.created);
        }),
        likes: result[2]
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
