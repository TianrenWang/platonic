const mongoose = require('mongoose');
const User = require('./user');
const Message = require('./message');
const extend = require('util')._extend;

var options = {discriminatorKey: 'kind'};

// conversation schema
const ConversationSchema = mongoose.Schema({
  participants: {
    type: [],
    required: false,
    unique: false
  },
  convoName: {
    type: String,
    required: true
  }
}, options);

ConversationSchema.statics.addConversation = (conversation, callback) => {
  conversation.save(callback);
};

ConversationSchema.statics.saveConversation = (conversationObj, callback) => {
  let conversation = new SavedConversation(conversationObj.conversation)
  let convoID = conversation._id.toHexString()
  let messages = conversationObj.messages
  for (i = 0; i < messages.length; i++) {
    messages[i]["conversationId"] = convoID;
    delete messages[i]._id
  }
  Message.collection.insertMany(
    conversationObj.messages, {ordered: true}
  )
  conversation.save(callback);
};

ConversationSchema.statics.saveThread = (message, callback) => {
  let thread = new Thread({originMsgId: message._id, convoName: message.text})
  thread.save(callback);
};

ConversationSchema.statics.getChatRoom = (callback) => {
  Conversation.findOne({convoName: "chat-room"}, (err, conversation) => {
    if (err || conversation == null) {
      let chatRoom = new Conversation({convoName: "chat-room"});
      Conversation.addConversation(chatRoom, (err, conv) => {
        if (err) return callback("There was an error on getting the conversation");
        return callback(null, conv);
      });
    } else {
      Message.getMessagesByConv(conversation._id, (err, messages) => {
        if (err) {
          let error = "There was an error on getting messages";
          return callback(error);
        } else {
          let conversationObj = extend({}, conversation);
          conversationObj.messages = messages;
          return callback(null, conversationObj);
        }
      });
    }
  });
};

ConversationSchema.statics.getConversationByParty = (participant1, participant2, callback) => {
  let combo1 = "" + participant1 + "-" + participant2;
  let combo2 = "" + participant2 + "-" + participant1;

  Conversation.findOne({convoName: combo1}, (err, conversation1) => {
    if (err || conversation1 == null) {
      Conversation.findOne({convoName: combo2}, (err, conversation2) => {
        if (err || conversation2 == null) {
          User.getUserByUsername(participant1, (err1, user1) => {
            if (err1 || user1 == null) {
              return callback("The user could not be found");
            }
            User.getUserByUsername(participant2, (err2, user2) => {
              if (err2 || user2 == null) {
                return callback("The user could not be found");
              }
              let mihai1 = {
                username: user1.username,
                id: user1._id
              };
              let mihai2 = {
                username: user2.username,
                id: user2._id
              };
              let participants = [mihai1, mihai2];
              let newConv = new Conversation({
                participants: participants,
                convoName: "" + mihai1.username + "-" + mihai2.username,
              });

              Conversation.addConversation(newConv, (err, addedConv) => {
                if (err) {
                  console.log(err);
                  let error = "There was an error on getting the conversation";
                  return callback(error);
                } else {
                  return callback(null, addedConv);
                }
              });
            });
          });
        } else {
          Message.getMessagesByConv(conversation2._id, (err, messages) => {
            if (err) {
              let error = "There was an error on getting messages";
              return callback(error);
            } else {
              let conversationObj = extend({}, conversation2);
              conversationObj.messages = messages;
              return callback(null, conversationObj);
            }
          });
        }
      });
    }

    else {
      Message.getMessagesByConv(conversation1._id, (err, messages) => {
        if (err) {
          let error = "There was an error on getting messages";
          return callback(error);
        } else {
          let conversationObj = extend({}, conversation1);
          conversationObj.messages = messages;
          return callback(null, conversationObj);
        }
      });
    }
  });
};

ConversationSchema.statics.getConversationsByUser = (username, callback) => {
  let conversationObj = {};
  conversationObj.conversations = {};
  Conversation.find({userName: username}, (err, conversations) => {
    if (err) {
      let error = "There was an error on getting conversations";
      return callback(error);
    } else if (conversations == null) {
      return callback(null, null);
    } else {
      conversationObj.conversations = conversations;
      return callback(null, conversationObj);
    }
  });
};

ConversationSchema.statics.getConversationById = (dialogueId, callback) => {
  let conversationObj = {};
  conversationObj.conversations = {};
  conversationObj.messages = {};
  Conversation.findById(dialogueId, (err, conversation) => {
    if (err) {
      let error = "There was an error on getting the conversation with id: " + dialogueId;
      return callback(error);
    } else if (conversation == null){
      return callback(null, null);
    } else {
      Message.find({conversationId: conversation._id}, function(err, messages){
        if (err) {
          let error = "There was an error on getting the conversation with id: " + dialogueId;
          return callback(error);
        } else if (messages == null) {
          return callback(null, null);
        } else {
          conversationObj.conversation = conversation;
          conversationObj.messages = messages;
          return callback(null, conversationObj);
        }
      });
    }
  });
};

const Conversation = mongoose.model('Conversation', ConversationSchema);

// Saved Conversation schema
var SavedConversation = Conversation.discriminator('SavedConversation',
  new mongoose.Schema({
    userName: {
      type: String,
      required: true
    },
    description: {
      type: String
    }
  }, options));

// Thread schema
var Thread = Conversation.discriminator('Thread',
  new mongoose.Schema({
    originMsgId: {
      type: String,
      required: true
    }
  }, options));

exports.Conversation = Conversation;
exports.SavedConversation = SavedConversation;
exports.Thread = Thread;
