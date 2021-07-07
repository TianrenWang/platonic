const mongoose = require('mongoose');
const { Message, Comment }= require('./message');
const Subscription = require('./subscription');
const { Notification, NEW_DIALOGUE } = require('./notification');
const async = require('async');
const { Reaction, reactionTypes } = require('./reaction');
const config = require('../config');
const webpush = require('web-push');
const slugify = require('slugify');

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
  slug: {
    type: String,
    required: true,
    unique: true
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

DialogueSchema.index({slug: 1, participants: 1, channel: 1});
DialogueSchema.statics.saveDialogue = (dialogue, messages, callback) => {
  let newDialogue = new Dialogue({ ...dialogue, slug: slugify(dialogue.title, config.slugify)});
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
      messages[i] = new Message(messages[i]);
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
    let notificationPayload = {
      notification: {
        title: `New Dialogue at ${completeDialogue.channel.name}`,
        icon: "favicon.ico",
        vibrate: [100, 50, 100],
        requireInteraction: true
      }
    }
    let push_notifications = [];
    for (let index = 0; index < populated_notifications.length; index++) {
      let notification = populated_notifications[index];
      let webpush_sub = notification.user.ng_webpush;
      notification.channel = completeDialogue.channel;
      notification.dialogue = completeDialogue;
      notification.user = notification.user._id;
      notificationPayload.notification.data = notification;
      notificationPayload.notification.body = completeDialogue.title;
      if (webpush_sub){
        push_notifications.push(webpush.sendNotification(webpush_sub, JSON.stringify(notificationPayload)));
      }
    }
    return Promise.all(push_notifications);
  })
  .then(() => {
    console.log("New dialogue notifications sent successfully");
  })
  .catch(error => {
    console.error("Failed to push notifications:", error.message);
  })
};

DialogueSchema.statics.getDialogueBySlug = (dialogueSlug, view, callback) => {
  let update = {}
  if (view === 'true'){
    update = {$inc : {'views' : 1}};
  }

  let calls = [];
  let retrievedDialogue;

  Dialogue.findOneAndUpdate({slug: dialogueSlug}, update, {new: true})
  .populate({
    path: 'participants',			
    model: 'User',
    select: config.userPropsToIgnore
  })
  .populate("channel")
  .then(dialogue => {
    retrievedDialogue = dialogue;
    let promises = [];
    promises.push(Message.find({dialogue: retrievedDialogue._id}).populate("from", "-password"));
    promises.push(Reaction.countDocuments({dialogue: retrievedDialogue._id, type: reactionTypes.LIKE}));
    promises.push(Comment.countDocuments({dialogue: retrievedDialogue._id}));
    return Promise.all(promises);
  })
  .then(result => {
    callback(null, {
      dialogue: retrievedDialogue,
      messages: result[0].sort(function(a,b){
        return new Date(a.created) - new Date(b.created);
      }),
      likes: result[1],
      comments: result[2]
    });
  })
  .catch(error => {
    callback(error);
  });
};

DialogueSchema.pre('deleteOne', function(next){
  Message.deleteMany({dialogue: this._conditions._id}).exec();
  Notification.deleteMany({dialogue: this._conditions._id}).exec();
  next();
})

const Dialogue = mongoose.model('Dialogue', DialogueSchema);
module.exports = Dialogue;
