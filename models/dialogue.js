const mongoose = require('mongoose');
const { Message, Comment }= require('./message');
const config = require('../config');
const slugify = require('slugify');

// conversation schema
const DialogueSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    default: function(){
      let idString = this._id.toString();
      idString = idString.substring(idString.length -  5);
      let title = this.title.substring(0, 40);
      let uniqueString = title + " " + idString;
      return slugify(uniqueString, config.slugify);
    },
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
});

DialogueSchema.index({slug: 1});
DialogueSchema.statics.saveDialogue = (title, description, messages, callback) => {
  let newDialogue = new Dialogue({
    title: title,
    description: description,
  });

  // Save the dialogue
  newDialogue.save().then(dialogue => {
    for (i = 0; i < messages.length; i++) {
      messages[i].dialogue = dialogue._id;
      messages[i] = new Message(messages[i]);
    }
    return Message.collection.insertMany(messages, {ordered: true, validate: true});
  })
  
  // Successfully saved the dialogue
  .then(() => {
    callback(null, newDialogue);
  })

  // deal with all errors that may occur while saving dialogue
  .catch(error => {
    console.error("Error saving dialogue:", error.message);
    callback(error, null);
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
    promises.push(Message.find({dialogue: retrievedDialogue._id}));
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
