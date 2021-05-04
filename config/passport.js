const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');
const config = require('./index');
const passport = require('passport');

exports.normal_authentication = passport => {
  let options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
    secretOrKey: config.secret,
  };

  passport.use(
    new JwtStrategy(options, (jwt_payload, done) => {
      User.getUserById(jwt_payload._id, (err, user) => {
        if (err) {
          return done(err, false);
        }

        if (user) {
          let signData = {
            _id: String(user._id),
            username: user.username,
          };
          return done(null, signData);
        } else {
          return done(null, false);
        }
      });
    })
  );
};

exports.nofail_authentication = function authenticateJwt(req, res, next) {
  passport.authenticate('jwt', function(err, user, info) {
    if (err) return next(err);
    if (user === false) user = null;
    req.user = user;
    next();
  })(req, res, next);
}
