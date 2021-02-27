const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const NEW_MESSAGE = 'NEW_MESSAGE';
const NEW_REQUEST = 'NEW_REQUEST';
const REQUEST_ACCEPTED = 'REQUEST_ACCEPTED';
const NEW_CONVERSATION = 'NEW_CONVERSATION';

// channel schema
const NotificationSchema = Schema({
    type: {
        type: String,
        enum: [
            NEW_MESSAGE,
            NEW_REQUEST,
            REQUEST_ACCEPTED,
            NEW_CONVERSATION
        ]
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    request: {
        type: Schema.Types.ObjectId,
        ref: 'ChatRequest',
        required: function(){
            return this.type === NEW_REQUEST || this.type === REQUEST_ACCEPTED;
        }
    },
    conversation: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: function(){
            return this.type === NEW_CONVERSATION;
        }
    }
});

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;
