const express = require('express');
const router = express.Router();
const passport = require('passport');
const Message = require('../models/message');
const {Conversation, SavedConversation, Thread} = require('../models/conversation');

// get chat-room conversation
router.get('/', (req, res, next) => {
  let response = {success: true};
  Conversation.getChatRoom((err, chatRoom) => {
    if (err || chatRoom == null) {
      response.success = false;
      response.msg = "There was an error on getting the conversation";
      res.json(response);
    } else {
      response.msg = "Conversation retrieved successfully";
      response.conversation = chatRoom;
      res.json(response);
    }
  });
});

// get conversation
router.get('/:name1/:name2', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  Conversation.getConversationByParty(req.params.name1, req.params.name2, (err, conversation) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error on getting the conversation";
      res.json(response);
    } else {
      response.msg = "Conversation retrieved successfuly";
      response.conversation = conversation;
      res.json(response);
    }
  });
});

// get conversation by username
router.get('/pastConvos', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  Conversation.getConversationsByUser(req.query.username, (err, conversations) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error on getting conversations for: " + req.params.username;
      res.json(response);
    } else {
      response.success = true;
      response.msg = "Conversations retrieved successfuly for user: " + req.params.username;
      response.conversationObj = conversations;
      res.json(response);
    }
  });
});

// get conversation by conversationId
router.get('/pastConvo', (req, res, next) => {
  let response = {success: true};
  Conversation.getConversationById(req.query.conversationId, (err, conversation) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error on getting conversations for: " + req.params.conversationId;
      res.json(response);
    } else {
      response.success = true;
      response.msg = "Conversation with id " +  req.params.conversationId + " was retrieved successfuly.";
      response.conversationObj = conversation;
      res.json(response);
    }
  });
});

// post conversation
router.post('/conversation', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  console.log("Posting conversation")
  let response = {success: true};
  Conversation.saveConversation(req.body, (err, conversation) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error saving the conversation";
      res.json(response);
    } else {
      response.msg = "Conversation saved successfully";
      response.conversation = conversation;
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
