const express = require('express');
const router = express.Router();
const passport = require('passport');
const Message = require('../models/message');
const {Conversation, SavedConversation} = require('../models/conversation');

// get chat-room conversation
router.get('/', passport.authenticate("jwt", {session: false}), (req, res, next) => {
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
router.get('/pastConvo', passport.authenticate("jwt", {session: false}), (req, res, next) => {
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
router.post('/', passport.authenticate("jwt", {session: false}), (req, res, next) => {
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

module.exports = router;
