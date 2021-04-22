const express = require('express');
const router = express.Router();
const passport = require('passport');
const no_fail_authenticate = require("../config/passport").nofail_authentication;
const Message = require('../models/message');
const Dialogue = require('../models/dialogue');
const { Reaction } = require('../models/reaction');
const config = require('../config');

// get dialogues by userId
router.get('/dialogues', (req, res, next) => {
  let response = {success: true};
  Dialogue.find({participants: req.query.userId}).sort({created: -1}).exec((err, dialogues) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error on getting dialogues";
      res.json(response);
    } else {
      response.msg = "Dialogues retrieved successfuly";
      response.dialogues = dialogues;
      res.json(response);
    }
  });
});

// get dialogues by channel
router.get('/dialoguesByChannel', (req, res, next) => {
  let response = {success: true};
  Dialogue.find({channel: req.query.channelId}).sort({created: -1}).exec((err, dialogues) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error on getting dialogues";
      res.json(response);
    } else {
      response.msg = "Dialogues retrieved successfuly";
      response.dialogues = dialogues;
      res.json(response);
    }
  });
});

// get dialogue by dialogueId
router.get('/dialogue', no_fail_authenticate, (req, res, next) => {
  let response = {success: true};
  Dialogue.getDialogueById(req.query.dialogueId, req.query.view, (err, dialogueObject) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      Object.assign(response, dialogueObject);
      if (req.user) {
        Reaction.find({user: req.user._id, dialogue: req.query.dialogueId}, (react_err, reactions) => {
          if (react_err) {
            response.success = false;
            response.error = react_err;
            res.json(response);
          } else {
            response.reactions = reactions;
            res.json(response);
          }
        });
      } else {
        res.json(response);
      }
    }
  });
});

// post dialogue
router.post('/dialogue', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  console.log("Posting conversation")
  let response = {success: true};
  Dialogue.saveDialogue(req.body.dialogue, req.body.messages, (err, dialogue) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error saving the dialogue";
      res.json(response);
    } else {
      response.msg = "Dialogue saved successfully";
      response.dialogue = dialogue;
      res.json(response);
    }
  });
});

// post dialogue
router.delete('/dialogue', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  Dialogue.deleteOne({_id: req.query.dialogueId}, (err) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error deleting the dialogue";
      res.json(response);
    } else {
      response.msg = "Dialogue deleted successfully";
      res.json(response);
    }
  });
});

// update dialogue
router.patch('/dialogue', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  Dialogue.findByIdAndUpdate({_id: req.query.dialogueId}, req.body, {new: true}).populate({
    path: 'participants',			
    model: 'User',
    select: config.userPropsToIgnore
  }).exec((err, dialogue) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      response.dialogue = dialogue;
      res.json(response);
    }
  });
});

// publish dialogue
router.patch('/publish', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  Dialogue.findByIdAndUpdate({_id: req.query.dialogueId}, {published: true}, {new: true}).populate({
    path: 'participants',			
    model: 'User',
    select: config.userPropsToIgnore
  }).exec((err, dialogue) => {
    if (err) {
      response.success = false;
      response.error = err.message;
      res.json(response);
    } else {
      response.dialogue = dialogue;
      res.json(response);
    }
  });
});

// get thread
router.get('/thread', (req, res, next) => {
  console.log("getting thread")
  let response = {success: true};
  Conversation.findOne({originMsgId: req.query.msgId}, (err, thread) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error searching for thread with message Id: " + req.query.threadId;
      res.json(response);
    } else if (!thread) {
      response.success = false;
      response.msg = "There was no thread that started with message Id: " + req.query.threadId;
      res.json(response);
    } else {
      response.msg = "Thread retrieved successfully";
      response.thread = thread;
      Message.find({conversationId: thread._id}, function(err, messages){
        if (err) {
          response.success = false;
          response.msg = "There was an error on getting the conversation with id: " + dialogueId;
        } else {
          response.messages = messages;
        }
        res.json(response);
      });
    }
  });
});

// post thread
router.post('/thread', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  console.log("Posting thread")
  let response = {success: true};
  Conversation.saveThread(req.body.message, (err, thread) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error starting the thread";
      res.json(response);
    } else {
      response.msg = "Thread saved successfully";
      response.thread = thread;
      res.json(response);
    }
  });
});

// post message
router.post('/threadmessage', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  console.log("Posting message")
  let response = {success: true};
  let message = req.body.message;
  message.conversationId = req.body.threadId;
  Message.addMessage(new Message(message), (err, newMsg) => {
    response.success = true;
    response.msg = "Message saved successfully";
    response.data = newMsg
    res.json(response);
  })
});

// react to dialogue
router.post('/reactDialogue', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  let reactionBody = { ... req.body, user: req.user._id };
  let reaction = new Reaction(reactionBody);
  reaction.save((err, reaction) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      response.reaction = reaction;
      res.json(response);
    }
  });
});

// delete reaction
router.delete('/unreact', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  Reaction.findByIdAndDelete(req.query.reactionId, (err) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      res.json(response);
    }
  });
});

module.exports = router;
