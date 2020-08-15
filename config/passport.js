const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');
const config = require('./index');

let extractor = ExtractJwt.fromAuthHeaderWithScheme("jwt")
if (config.env === "production"){
  extractor = ExtractJwt.fromAuthHeaderAsBearerToken()
}

module.exports = passport => {
  let options = {
    jwtFromRequest: extractor,
    secretOrKey: config.secret,
  };

  passport.use(
    new JwtStrategy(options, (jwt_payload, done) => {
      User.getUserById(jwt_payload.id, (err, user) => {
        if (err) {
          return done(err, false);
        }

        if (user) {
          let signData = {
            id: user._id,
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
