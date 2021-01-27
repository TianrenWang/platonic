const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');
const log = require('../log');
const twilioTokenGenerator = require('../util/twilio_token_generator');

// This might be deprecated since I am unlikely to switch to MySQL for now
// const mysqlUser = require('../models/mysqlUser');
// const nodeify = require('nodeify');

// register
router.post('/register', (req, res, next) => {
  let response = { success: false };
  if (!(req.body.password == req.body.confirmPass)) {
    let err = "The passwords don't match";
    return next(err);
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

router.post('/authenticate', (req, res, next) => {
  let body = req.body;
  let response = { success: false };

  User.authenticate(body.username.trim(), body.password.trim(), (err, user) => {
    if (err) {
      response.msg = err.msg;
      res.json(response);
    } else {
      // create the unique token for the user
      let signData = {
        _id: user._id,
        username: user.username,
        email: user.email
      };
      let token = jwt.sign(signData, config.secret, {
        expiresIn: 604800,
      });

      response.token = 'JWT ' + token;
      response.user = signData;
      response.success = true;
      response.msg = 'User authenticated successfuly';

      console.log('[%s] authenticated successfuly', user.username);
      res.json(response);
    }
  });
});

// twilio access token
router.get(
  '/twilio',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    let response = { success: true };
    response.msg = 'Twilio access token retrieved successfuly';
    response.token = twilioTokenGenerator(req.user.username);
    response.username = req.user.username;
    res.json(response);
  }
);

// profile
router.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    let response = { success: true };
    response.msg = 'Profile retrieved successfuly';
    response.user = req.user;
    res.json(response);
  }
);

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
  User.deleteOne({username: req.query.username}, (err, user) => {
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
