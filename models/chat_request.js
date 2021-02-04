const mongoose = require('mongoose');
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
    }
});

ChatRequestSchema.index({user: 1, channel: 1}, { unique: true });
ChatRequestSchema.statics.createChatRequest = (userId, channelId, description, callback) => {
    let chatRequestObj = new ChatRequest({
        user: userId,
        channel: channelId,
        description: description
    });
    chatRequestObj.save(callback);
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

const ChatRequest = mongoose.model('ChatRequest', ChatRequestSchema);

module.exports = ChatRequest;
