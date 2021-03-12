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
        required: true
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: 'Channel',
        required: function(){
            return this.type === NEW_REQUEST || this.type === REQUEST_ACCEPTED || this.type === NEW_DIALOGUE;
        }
    },
    read: {
        type: Boolean,
        default: false
    },
    interacted: {
        type: Boolean,
        default: function(){
            return this.type === REQUEST_ACCEPTED;
        }
    },
    request: {
        type: Schema.Types.ObjectId,
        ref: 'ChatRequest',
        required: function(){
            return this.type === NEW_REQUEST || this.type === REQUEST_ACCEPTED;
        }
    },
    dialogue: {
        type: Schema.Types.ObjectId,
        ref: 'Dialogue',
        required: function(){
            return this.type === NEW_DIALOGUE;
        }
    },
    date: {
        type: Date,
        default: function(){
            return new Date();
        }
    }
});

NotificationSchema.index({user: 0, channel: 0, request: 0, date: -1, dialogue: 0});
const Notification = mongoose.model('Notification', NotificationSchema);
exports.Notification = Notification;
exports.NEW_MESSAGE = NEW_MESSAGE;
exports.NEW_REQUEST = NEW_REQUEST;
exports.REQUEST_ACCEPTED = REQUEST_ACCEPTED;
exports.NEW_DIALOGUE = NEW_DIALOGUE;
