const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const Membership = require('./membership');
const ChatRequest = require('./chat_request');
const Subscription = require('./subscription');
const Notification = require('./notification');
const config = require('../config');

// user schema
const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  photoUrl: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null
  },
  ng_webpush: {
    type: Object,
    default: null
  },
  onboarded: {
    type: Boolean,
    default: false
  }
}, { toJSON: { virtuals: true } });

UserSchema.virtual('numMemberships', {
  ref: 'Membership',
  localField: '_id',
  foreignField: 'user',
  count: true
});

UserSchema.virtual('numSubscriptions', {
  ref: 'Subscription',
  localField: '_id',
  foreignField: 'user',
  count: true
});

UserSchema.virtual('numDialogues', {
  ref: 'Dialogue',
  localField: '_id',
  foreignField: 'participants',
  count: true
});

UserSchema.statics.getUsers = () => {
  return User.find({}, config.userPropsToIgnore);
}

UserSchema.statics.addUser = function(newUser, callback) {
  User.findOne({username: newUser.username}, (err, user) => {
    if (err) return callback({msg: "There was an error on getting the user"});
    if (user) {
      let error = {msg: "Username is already in use"};
      return callback(error);
    } else {
      User.findOne({email: newUser.email}, (err, user) => {
        if (err) return callback({msg: "There was an error on getting the user by email"});
        if (user) {
          let error = {msg: "Email is already in use"};
          return callback(error);
        } else {
          bcryptjs.genSalt(10, (err, salt) => {
            bcryptjs.hash(newUser.password, salt, (err, hash) => {
              if (err) return callback({msg: "There was an error registering the new user"});
    
              newUser.password = hash;
              newUser.save(callback);
            });
          });
        }
      })
    }
  })
};

UserSchema.statics.authenticate = function(username, password, callback) {
  User.findOne({username: username}, (err, user) => {
    if (err) return callback({msg: "There was an error on getting the user"});
    if (!user) {
      let error = {msg: "Wrong username or password"};
      return callback(error);
    } else {
      bcryptjs.compare(password, user.password, (err, result) => {
        if (result == true) {
          return callback(null, user);
        } else {
          let error = {msg: "Wrong username or password"};
          return callback(error);
        }
      });
    }
  });
};

UserSchema.statics.updatePassword = function(userId, passwords, callback) {
  User.findById(userId, (find_err, user) => {
    if (find_err) {
      callback(new Error('Could not find the requested user'));
    } else {
      bcryptjs.compare(passwords.old_password, user.password, (pass_err, result) => {
        if (result == true) {
          bcryptjs.genSalt(10, (salt_err, salt) => {
            bcryptjs.hash(passwords.new_password, salt, (hash_error, hash) => {
              User.findByIdAndUpdate(userId, {password: hash}, callback);
            });
          });
        } else {
          return callback(new Error("Old passwords did not match"));
        }
      });
    }
  });
};

UserSchema.pre('deleteOne', function(next){
  Membership.deleteMany({user: this._conditions._id}).exec();
  ChatRequest.deleteMany({user: this._conditions._id}).exec();
  Subscription.deleteMany({user: this._conditions._id}).exec();
  Notification.Notification.deleteMany({user: this._conditions._id}).exec();
  next();
})

const User = mongoose.model('User', UserSchema);

const options = { discriminatorKey: 'kind' };
const ExternalUser = User.discriminator(
  'ExternalUser',
  new mongoose.Schema({
    platform: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: function(){
        return this.validated === true;
      },
    },
    email: {
      type: String,
      required: function(){
        return this.validated === true;
      },
    },
    validated: {
      type: Boolean,
      default: false,
    },
    externalId: {
      type: String,
      required: true,
      indexed: true,
      unique: true,
    },
  }, options)
);

exports.User = User;
exports.ExternalUser = ExternalUser;
