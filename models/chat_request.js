const mongoose = require('mongoose');
const Membership = require('./membership');
const Notification = require('./notification');
const Schema = mongoose.Schema;
const config = require('../config');
const webpush = require('web-push');
const slugify = require('slugify');

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
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
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

ChatRequestSchema.index({slug: 1, user: 1, channel: 1});
ChatRequestSchema.statics.createChatRequest = (userId, channelId, chatRequestInfo, callback) => {
    let slug = slugify(chatRequestInfo.title, config.slugify);
    let chatRequestObj = new ChatRequest({
        ... chatRequestInfo,
        user: userId,
        channel: channelId,
        slug: slug,
    });
    let completeRequest;
    chatRequestObj.save().then(() => {
        return ChatRequest.populate(chatRequestObj, [
            {path: 'user', select: config.userPropsToIgnore},
            {path: 'channel'}
        ]);
    })

    .then(result => {
        completeRequest = result;
        callback(null, result);
    })

    // deal with all errors that may occur while saving chat request
    .catch(error => {
        console.error("Error saving chat request:", error.message);
        callback(error, null);
    })
  
    // fetch all members for this particular channel
    .then(() => {
        return Membership.find({channel: channelId});
    })

    // Create notifications for all members
    .then(memberships => {
        let notifications = [];
        for (let index = 0; index < memberships.length; index++) {
            notifications.push({
                type: Notification.NEW_REQUEST,
                user: memberships[index].user,
                channel: channelId,
                request: completeRequest._id
            });
        }
        return Notification.Notification.insertMany(notifications, {populate: {path: "user", select: '-password'}});
    })

    // Send push notification
    .then((populated_notifications) => {
        let notificationPayload = {
            notification: {
                title: "Chat Request",
                icon: "favicon.ico",
                vibrate: [100, 50, 100],
                requireInteraction: true
            }
        }
        let push_notifications = [];
        for (let index = 0; index < populated_notifications.length; index++) {
            let notification = populated_notifications[index];
            let webpush_sub = notification.user.ng_webpush;
            notification.channel = completeRequest.channel;
            notification.request = completeRequest;
            notification.user = notification.user._id;
            notificationPayload.notification.data = notification;
            notificationPayload.notification.body = `At ${notification.channel.name}`;
            if (webpush_sub){
                push_notifications.push(webpush.sendNotification(webpush_sub, JSON.stringify(notificationPayload)));
            }
        }
        return Promise.all(push_notifications);
    })
    .then(() => {
        console.log("Chat request notifications sent successfully");
    })
    .catch(error => {
        console.error("Failed to push notifications:", error.message);
    })
};

ChatRequestSchema.statics.getAllChatRequestsForChannel = (channelId, callback) => {
    ChatRequest.find({channel: channelId}, (err, requests) => {
        if (err){
            callback(err, memberships);
        } else {
            ChatRequest.populate(requests, {path: "user", select: config.userPropsToIgnore}, (populate_err, populatedRequests) => {
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
    let completeRequest;

    ChatRequest.findByIdAndUpdate(requestId, {acceptor: acceptor}, {new: true})
    .populate('user', config.userIgnorePassOnly)
    .populate('acceptor', config.userPropsToIgnore)
    .populate('channel')

    .then(result => {
        completeRequest = result;
        callback(null, result);
    })

    // deal with all errors that may occur while patching chat request
    .catch(error => {
        console.error("Error patching chat request:", error.message);
        callback(error, null);
    })

    // Create notification document
    .then(() => {
        let notification = new Notification.Notification({
            type: Notification.REQUEST_ACCEPTED,
            user: completeRequest.user._id,
            channel: completeRequest.channel._id,
            request: completeRequest._id
        });
        return notification.save();
    })

    // Send push notification
    .then(notification => {
        let webpush_sub = completeRequest.user.ng_webpush;
        notification.channel = completeRequest.channel;
        notification.request = completeRequest;
        notification.user = notification.user._id;

        let notificationPayload = {
            notification: {
                title: "Chat Request Accepted",
                icon: "favicon.ico",
                vibrate: [100, 50, 100],
                requireInteraction: true,
                data: notification,
                body: `At ${notification.channel.name}`
            }
        }
        if (webpush_sub){
            return webpush.sendNotification(webpush_sub, JSON.stringify(notificationPayload));
        } else {
            return Promise.resolve();
        }
    })
    .then(() => {
        console.log("Chat request acceptance notification sent successfully");
    })
    .catch(error => {
        console.error("Failed to push notification:", error.message);
    })
};

ChatRequestSchema.pre('deleteOne', function(next){
    Notification.Notification.deleteMany({request: this._conditions._id}).exec();
    next();
})

const ChatRequest = mongoose.model('ChatRequest', ChatRequestSchema);

module.exports = ChatRequest;
