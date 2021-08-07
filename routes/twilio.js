const express = require('express');
const router = express.Router();
const passport = require('passport');
const { service } = require('../util/twilio');
const Dialogue = require('../models/dialogue');

// Modify a Twilio Message
router.patch('/modifyMessage', passport.authenticate("jwt", {session: false}), (req, res, next) => {
    let response = {success: true};
    if (req.body.body || req.body.attributes){
        req.body.attributes = JSON.stringify(req.body.attributes);
        service.channels(req.query.channelId)
        .messages(req.query.messageId)
        .update(req.body)
        .then(() => {
            response.msg = "Message updated successfully";
            res.json(response);
        }).catch((error) => {
            response.success = false;
            response.msg = error;
            res.json(response);
        });
    } else {
        response.success = false;
        response.msg = "Request query does not have either body or attributes";
        res.json(response);
    }
});

// Create a channel and make two users as members
router.post('/channel', passport.authenticate("jwt", {session: false}), (req, res, next) => {
    let response = {success: true};
    let channel = req.body.channel;
    let attributes = {
        participants: [req.body.user, req.body.acceptor],
        debate: channel.debate,
        platonicChannel: channel
    };
    service.channels
    .create({
        friendlyName: channel.name,
        attributes: JSON.stringify(attributes)
    })
    .then(channel => {
        let createMemebership = [];
        let membersCreator = service.channels(channel.sid).members;
        createMemebership.push(membersCreator.create({identity: req.body.user.username}));
        createMemebership.push(membersCreator.create({identity: req.body.acceptor.username}));
        response.channel = channel;
        return Promise.all(createMemebership);
    })
    .then(memberships => {
        res.json(response);
    })
    .catch((error) => {
        response.success = false;
        response.message = error.message;
        res.json(response);
    });
});

// Archive all messages in a channel and delete it
router.post('/dialogue', passport.authenticate("jwt", {session: false}), (req, res, next) => {
    let response = {success: true};
    let participants = req.body.participants;
    service.channels(req.query.twilioChannelId)
    .messages
    .list()
    .then(messages => {
        let platonic_messages = [];
        messages.forEach(message => {
            let userId;
            if (message.from === participants[0].username){
                userId = participants[0]._id;
            } else {
                userId = participants[1]._id;
            }
            platonic_messages.push({
                created: message.dateCreated,
                from:  userId,
                text: message.body,
                attributes: JSON.parse(message.attributes)
            });
        });
        Dialogue.saveDialogue(req.body, platonic_messages, (err, dialogue) => {
            if (err) {
                response.success = false;
                response.error = err;
                res.json(response);
            } else {
                response.dialogue = dialogue;
                res.json(response);
            }
        });
    })
    .catch((error) => {
        response.success = false;
        response.error = error;
        res.json(response);
    });
});

module.exports = router;
