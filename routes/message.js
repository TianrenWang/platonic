const express = require('express');
const router = express.Router();
const passport = require('passport');
const no_fail_authenticate = require("../config/passport").nofail_authentication;
const { Comment } = require('../models/message');
const Dialogue = require('../models/dialogue');
const { Reaction } = require('../models/reaction');
const config = require('../config');

// get dialogues by userId
router.get('/dialogues', (req, res, next) => {
  let response = {success: true};
  Dialogue.find({participants: req.query.userId})
  .sort({created: -1})
  .populate("channel")
  .populate({ path: 'participants', model: 'User', select: config.userPropsToIgnore })
  .exec((err, dialogues) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error on getting dialogues";
      res.json(response);
    } else {
      response.msg = "Dialogues retrieved successfuly";
      response.dialogues = dialogues;
      res.json(response);
    }
  });
});

// get dialogues by channel
router.get('/dialoguesByChannel', (req, res, next) => {
  let response = {success: true};
  Dialogue.find({channel: req.query.channelId})
  .sort({created: -1})
  .populate("channel")
  .populate({ path: 'participants', model: 'User', select: config.userPropsToIgnore })
  .exec((err, dialogues) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error on getting dialogues";
      res.json(response);
    } else {
      response.msg = "Dialogues retrieved successfuly";
      response.dialogues = dialogues;
      res.json(response);
    }
  });
});

// get dialogue by dialogueId
router.get('/dialogue', no_fail_authenticate, (req, res, next) => {
  let response = {success: true};
  Dialogue.getDialogueById(req.query.dialogueId, req.query.view, (err, dialogueObject) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      Object.assign(response, dialogueObject);
      if (req.user) {
        Reaction.find({user: req.user._id, dialogue: req.query.dialogueId}, (react_err, reactions) => {
          if (react_err) {
            response.success = false;
            response.error = react_err;
            res.json(response);
          } else {
            response.reactions = reactions;
            res.json(response);
          }
        });
      } else {
        res.json(response);
      }
    }
  });
});

// post dialogue
router.post('/dialogue', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  Dialogue.saveDialogue(req.body.dialogue, req.body.messages, (err, dialogue) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      response.dialogue = dialogue;
      res.json(response);
    }
  });
});

// post dialogue
router.delete('/dialogue', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  Dialogue.deleteOne({_id: req.query.dialogueId}, (err) => {
    if (err) {
      response.success = false;
      response.msg = "There was an error deleting the dialogue";
      res.json(response);
    } else {
      response.msg = "Dialogue deleted successfully";
      res.json(response);
    }
  });
});

// update dialogue
router.patch('/dialogue', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  Dialogue.findByIdAndUpdate({_id: req.query.dialogueId}, req.body, {new: true}).populate({
    path: 'participants',			
    model: 'User',
    select: config.userPropsToIgnore
  }).exec((err, dialogue) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      response.dialogue = dialogue;
      res.json(response);
    }
  });
});

// publish dialogue
router.patch('/publish', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  Dialogue.findByIdAndUpdate({_id: req.query.dialogueId}, {published: true}, {new: true}).populate({
    path: 'participants',			
    model: 'User',
    select: config.userPropsToIgnore
  }).exec((err, dialogue) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      response.dialogue = dialogue;
      res.json(response);
    }
  });
});

// get comments
router.get('/comments', (req, res, next) => {
  let response = {success: true};
  Comment.find({dialogue: req.query.dialogueId})
  .sort({created: -1})
  .populate('from', config.userPropsToIgnore)
  .exec((err, comments) => {
    if (err) {
      response.success = false;
      response.error = err;
    } else {
      response.comments = comments;
    }
    res.json(response);
  });
});

// post comment
router.post('/comment', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  let comment = new Comment({ ... req.body, from: req.user._id });
  comment.save().then(() => {
    return Comment.populate(comment, [
      {path: 'from', select: config.userPropsToIgnore},
      {path: 'dialogue'}
    ])
  })
  .then(populated_comment => {
    response.comment = populated_comment;
    res.json(response);
  })
  .catch(error => {
    response.success = false;
    response.error = error;
    res.json(response);
  });
});

// react to dialogue
router.post('/reactDialogue', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  let reactionBody = { ... req.body, user: req.user._id };
  let reaction = new Reaction(reactionBody);
  reaction.save((err, reaction) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      response.reaction = reaction;
      res.json(response);
    }
  });
});

// delete reaction
router.delete('/unreact', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  Reaction.findByIdAndDelete(req.query.reactionId, (err) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      res.json(response);
    }
  });
});

module.exports = router;
