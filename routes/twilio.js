const express = require('express');
const router = express.Router();
const passport = require('passport');
const config = require('../config').twilio;

const client = require('twilio')(config.account_sid, config.auth_token);

// Modify a Twilio Message
router.patch('/modifyMessage', passport.authenticate("jwt", {session: false}), (req, res, next) => {
    let response = {success: true};
    if (req.body.body || req.body.attributes){
        req.body.attributes = JSON.stringify(req.body.attributes);
        client.chat.services(config.chat_service_sid)
            .channels(req.query.channelId)
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

module.exports = router;
