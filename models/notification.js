const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const NEW_MESSAGE = 'NEW_MESSAGE';
const NEW_REQUEST = 'NEW_REQUEST';
const REQUEST_ACCEPTED = 'REQUEST_ACCEPTED';
const NEW_DIALOGUE = 'NEW_DIALOGUE';

// channel schema
const NotificationSchema = Schema({
    type: {
        type: String,
        enum: [
            NEW_MESSAGE,
            NEW_REQUEST,
            REQUEST_ACCEPTED,
            NEW_DIALOGUE
        ]
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: 'Channel',
        required: function(){
            return this.type === NEW_REQUEST || this.type === REQUEST_ACCEPTED || this.type === NEW_DIALOGUE;
        },
        index: true
    },
    read: {
        type: Boolean,
        default: false
    },
    request: {
        type: Schema.Types.ObjectId,
        ref: 'ChatRequest',
        required: function(){
            return this.type === NEW_REQUEST || this.type === REQUEST_ACCEPTED;
        },
        index: true
    },
    dialogue: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: function(){
            return this.type === NEW_DIALOGUE;
        },
        index: true
    },
    date: {
        type: Date,
        default: function(){
            return new Date();
        }
    }
});

NotificationSchema.index({date: -1});
const Notification = mongoose.model('Notification', NotificationSchema);
exports.Notification = Notification;
exports.NEW_MESSAGE = NEW_MESSAGE;
exports.NEW_REQUEST = NEW_REQUEST;
exports.REQUEST_ACCEPTED = REQUEST_ACCEPTED;
exports.NEW_DIALOGUE = NEW_DIALOGUE;
