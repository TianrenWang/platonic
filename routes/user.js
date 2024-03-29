const express = require('express');
const router = express.Router();
const { User, ExternalUser } = require('../models/user');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');
const log = require('../log');
const { tokenGenerator } = require('../util/twilio');
const Notification = require('../models/notification');
const { uploadProfilePhoto } = require('../config/aws');
const no_fail_authenticate = require("../config/passport").nofail_authentication;

// This might be deprecated since I am unlikely to switch to MySQL for now
// const mysqlUser = require('../models/mysqlUser');
// const nodeify = require('nodeify');

// register
router.post('/register', (req, res, next) => {
  let response = { success: false };
  if (req.body.password !== req.body.confirmPass) {
    response.msg = "The passwords don't match";
    res.json(response);
  } else {
    let newUser = new User({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email
    });

    User.addUser(newUser, (err, user) => {
      if (err) {
        response.msg = err.msg || 'Failed to register user';
        res.json(response);
      } else {
        response.success = true;
        response.msg = 'User registered successfuly';
        response.user = {
          _id: user._id,
          username: user.username,
        };
        console.log('[%s] registered successfuly', user.username);
        res.json(response);
      }
    });
  }
});

// Login
router.post('/authenticate', (req, res, next) => {
  let body = req.body;
  let response = { success: false };

  User.authenticate(body.username.trim(), body.password.trim(), (err, user) => {
    if (err) {
      response.error = err;
      res.json(response);
    } else {
      // create the unique token for the user
      let signData = {
        _id: user._id,
        username: user.username
      };
      let token = jwt.sign(signData, config.secret, {
        expiresIn: 604800,
      });
      user.password = undefined;
      response.token = 'JWT ' + token;
      response.user = user;
      response.success = true;

      console.log('[%s] authenticated successfuly', user.username);
      res.json(response);
    }
  });
});

// Finish onboarding
router.patch('/onboard', passport.authenticate('jwt', { session: false }),  (req, res, next) => {
  let response = { success: false };
  User.findByIdAndUpdate(req.user._id, {onboarded: true}).then(() => {
    response.success = true;
    res.json(response);
  }).catch(err => {
    response.error = err;
    res.json(response);
  });
});

// refresh token
router.post('/refresh_token', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  let response = { success: true };
  let signData = {
    _id: req.user._id,
    username: req.user.username
  };
  let token = jwt.sign(signData, config.secret, {
    expiresIn: 604800,
  });
  response.token = 'JWT ' + token;
  response.msg = 'User authenticated successfuly';

  console.log('[%s] authenticated successfuly', req.user.username);
  res.json(response);
});

// twilio access token
router.get(
  '/twilio',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    let response = { success: true };
    response.msg = 'Twilio access token retrieved successfuly';
    response.token = tokenGenerator(req.user.username);
    response.username = req.user.username;
    res.json(response);
  }
);

// get profile
router.get('/profile', no_fail_authenticate, (req, res, next) => {
  let username = req.query.username ? req.query.username : (req.user ? req.user.username : null);
  if (!username) {
    response.success = false;
    response.error = new Error("Cannot identify username from request.");
    res.json(response);
    return;
  }
  let response = { success: true };
  User.findOne({username: username})
  .select(config.userPropsToIgnore)
  .populate('numMemberships')
  .populate('numSubscriptions')
  .populate('numDialogues')
  .exec()
  .then((user) => {
    response.user = user;
    res.json(response);
  }).catch((error) => {
    response.success = false;
    response.error = error;
    res.json(response);
  })
});

// update profile
router.patch(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    let response = { success: true };
    if (req.body._id || req.body.password){
      response.success = false;
      response.error = new Error("Cannot directly modify userId or password.");
      res.json(response);
      return;
    }
    User.findByIdAndUpdate(req.user._id, req.body, {new: true})
    .select(config.userPropsToIgnore)
    .exec((error, user) => {
      if (error) {
        response.success = false;
        response.error = error;
        res.json(response);
      } else {
        response.user = user;
        res.json(response);
      }
    });
  }
);

// notification
router.get('/notifications', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    let response = { success: true };
    Notification.Notification.find({user: req.user._id})
    .populate("channel")
    .populate({
      path: 'request',			
      populate: { path: 'acceptor', model: 'User', select: config.userPropsToIgnore  }
    })
    .populate({
      path: 'dialogue',			
      populate: { path: 'participants', model: 'User', select: config.userPropsToIgnore }
    })
    .sort({date: -1})
    .limit(10)
    .exec((err, notifications) => {
      if (err) {
        response.success = false;
        response.error = err;
        res.json(response);
      } else {
        response.notifications = notifications;
        res.json(response);
      }
    })
  }
);

// unread notification count
router.get('/unreadNotifCount', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  let response = { success: true };
  Notification.Notification.countDocuments({user: req.user._id, read: false}, (count_err, count) => {
    if (count_err) {
      response.success = false;
      response.error = count_err;
      res.json(response);
    } else {
      response.count = count;
      res.json(response);
    }
  });
});

// read notification
router.patch('/readNotification', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  let response = { success: true };
  Notification.Notification.findByIdAndUpdate(req.query.notificationId, {read: true}, (error, _) => {
    if (error) {
      response.success = false;
      response.error = error;
      res.json(response);
    } else {
      res.json(response);
    }
  });
});

// update photo
router.patch('/updatePhoto',
  passport.authenticate('jwt', { session: false }),
  uploadProfilePhoto.single("photoFile"),
  (req, res, next) => {
  let response = { success: true };
  User.findByIdAndUpdate(req.user._id, {photoUrl: req.file.location}, {new: true}, (error, user) => {
    if (error) {
      response.success = false;
      response.error = error;
      res.json(response);
    } else {
      response.user = user;
      res.json(response);
    }
  });
});

// update password
router.patch('/password', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  let response = { success: true };
  if (req.body.new_password !== req.body.confirm_password) {
    response.message = 'New passwords do not match';
    response.success = false;
    res.json(response);
    return;
  }
  if (req.body.new_password === req.body.old_password) {
    response.success = false;
    response.message = 'New password is not different from old password';
    res.json(response);
    return;
  }
  User.updatePassword(req.user._id, req.body, (error) => {
    if (error) {
      response.success = false;
      response.message = error.message;
      res.json(response);
    } else {
      res.json(response);
    }
  });
});

// user list
router.get('/', (req, res, next) => {
  User.getUsers()
    .then(users => {
      let response = {
        success: true,
        users: users,
      };
      return res.json(response);
    })
    .catch(err => {
      log.err('mongo', 'failed to get users', err.message || err);
      return next(new Error('Failed to get users'));
    });
});

// delete the user by username
router.delete('/', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  let response = { success: false };
  User.deleteOne({_id: req.user._id}, (err, user) => {
    if (err) {
      response.msg = err.msg;
      res.json(response);
    } else {
      response.msg = 'Successfully deleted user', req.query.username;
      response.success = true;
      res.json(response);
    }
  })
});

// create a new external user
router.post('/externalUser', (req, res, next) => {
  let response = { success: false };
  if (req.body.api_key !== config.sophists_api_key){
    res.status(401).send('Incorrect API key');
    return;
  }
  let externalUser = new ExternalUser(req.body.user);
  externalUser.save().then((result) => {
    response.success = true;
    response.user = result;
  }).catch((error) => {
    response.error = error;
    res.json(response);
  });
});

/* This might be deprecated since I am unlikely to switch to MySQL for now
// create mysql user
router.post('/mysqlUser', (req, res, next) => {
  nodeify(mysqlUser.create(req.body), (err, user) => {
    if (err) throw err;
    let response = {
      success: true,
      user: user,
    };
    res.json(response);
  })
});

// find all mysql users
router.get('/mysqlUsers', (req, res, next) => {
  nodeify(mysqlUser.findAll(), (err, users) => {
    if (err) throw err;
    let response = {
      success: true,
      users: users,
    };
    res.json(response);
  })
});
*/

module.exports = router;
