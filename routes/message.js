const express = require('express');
const router = express.Router();
const passport = require('passport');
const Message = require('../models/message');
const Dialogue = require('../models/dialogue');

// get dialogues by userId
router.get('/dialogues', (req, res, next) => {
  let response = {success: true};
  Dialogue.find({participants: req.query.userId}, (err, dialogues) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error on getting dialogues";
      res.json(response);
    } else {
      response.success = true;
      response.msg = "Dialogues retrieved successfuly";
      response.dialogues = dialogues;
      res.json(response);
    }
  });
});

// get dialogues by channel
router.get('/dialoguesByChannel', (req, res, next) => {
  let response = {success: true};
  Dialogue.find({channel: req.query.channelId}, (err, dialogues) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error on getting dialogues";
      res.json(response);
    } else {
      response.success = true;
      response.msg = "Dialogues retrieved successfuly";
      response.dialogues = dialogues;
      res.json(response);
    }
  });
});

// get dialogue by dialogueId
router.get('/dialogue', (req, res, next) => {
  let response = {success: true};
  Dialogue.getDialogueById(req.query.dialogueId, req.query.view, (err, dialogueObject) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      response.success = true;
      response.dialogue = dialogueObject.dialogue;
      response.dialogue.views += 1;
      response.messages = dialogueObject.messages;
      res.json(response);
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

// post conversation
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

module.exports = router;
