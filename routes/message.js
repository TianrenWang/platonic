const express = require('express');
const router = express.Router();
const { Comment } = require('../models/message');
const Dialogue = require('../models/dialogue');
const config = require('../config');

// get dialogues by userId
router.get('/dialogues', (req, res, next) => {
  let response = {success: true};
  Dialogue.find({})
  .sort({created: -1})
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
router.get('/dialogue', (req, res, next) => {
  let response = {success: true};
  Dialogue.getDialogueBySlug(req.query.dialogueSlug, req.query.view, (err, dialogueObject) => {
    if (err) {
      response.success = false;
      response.error = err;
      res.json(response);
    } else {
      Object.assign(response, dialogueObject);
      if (req.user) {
        Reaction.find({user: req.user._id, dialogue: dialogueObject.dialogue._id}, (react_err, reactions) => {
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
router.post('/dialogue', (req, res, next) => {
  let response = {success: true};
  Dialogue.saveDialogue(req.body.title, req.body.description, req.body.messages, (err, dialogue) => {
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
router.delete('/dialogue', (req, res, next) => {
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
router.post('/comment', (req, res, next) => {
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

module.exports = router;
