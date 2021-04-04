const mongoose = require('mongoose');
const Membership = require('./membership');
const Notification = require('./notification');
const Schema = mongoose.Schema;

// channel schema
const ChatRequestSchema = mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: 'Channel',
        required: true
    },
    description: {
        type: String
    },
    acceptor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    created: {
        type: Date,
        default: function(){
            return new Date();
        }
    }
});

ChatRequestSchema.index({user: 1, channel: 1});
ChatRequestSchema.statics.createChatRequest = (userId, channelId, description, callback) => {
    let chatRequestObj = new ChatRequest({
        user: userId,
        channel: channelId,
        description: description
    });
    chatRequestObj.save((req_error, request) => {
        if (req_error){
            callback(req_error, null);
        } else {
            Membership.find({channel: channelId}, (member_error, memberships) => {
                if (member_error){
                    callback(member_error, null);
                } else {
                    let notifications = [];
                    for (let index = 0; index < memberships.length; index++) {
                        notifications.push({
                            type: Notification.NEW_REQUEST,
                            user: memberships[index].user,
                            channel: channelId,
                            request: request._id
                        });
                    }
                    Notification.Notification.insertMany(notifications);
                    callback(null, request);
                }
            });
        }
    });
};

ChatRequestSchema.statics.getAllChatRequestsForChannel = (channelId, callback) => {
    ChatRequest.find({channel: channelId}, (err, requests) => {
        if (err){
            callback(err, memberships);
        } else {
            ChatRequest.populate(requests, {path: "user", select: '-password'}, (populate_err, populatedRequests) => {
                if (populate_err) {
                    callback(populate_err, populatedRequests);
                } else {
                    // if the populating was successful, clean the object
                    let requestingUsers = [];
                    for (let index = 0; index < populatedRequests.length; index++) {
                        requestingUsers.push(populatedRequests[index].channel);
                    }
                    callback(populate_err, requestingUsers);
                }
            })
        }
    })
};

ChatRequestSchema.statics.acceptChatRequest = (requestId, accceptorId, callback) => {
    let acceptor = new mongoose.Types.ObjectId(accceptorId);
    ChatRequest.findByIdAndUpdate(requestId, {acceptor: acceptor}, (err, request) => {
        if (err) {
            callback(err);
        } else {
            new Notification.Notification({
                type: Notification.REQUEST_ACCEPTED,
                user: request.user,
                channel: request.channel,
                request: request._id
            }).save(callback);
        }
    });
};

ChatRequestSchema.pre('deleteOne', function(next){
    Notification.Notification.deleteMany({request: this._conditions._id}).exec();
    next();
})

const ChatRequest = mongoose.model('ChatRequest', ChatRequestSchema);

module.exports = ChatRequest;
