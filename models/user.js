const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const Membership = require('./membership');
const ChatRequest = require('./chat_request');
const Subscription = require('./subscription');
const Notification = require('./notification');

// user schema
const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
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
    type: String
  }
});

UserSchema.statics.getUserById = function(id, callback) {
  User.findById(id, callback);
}

UserSchema.statics.getUserByUsername = function(username, callback) {
  let query = {username: username};
  User.findOne(query, callback);
}

UserSchema.statics.getUsers = () => {
  return User.find({}, '-password');
}

UserSchema.statics.addUser = function(newUser, callback) {
  User.getUserByUsername(newUser.username, (err, user) => {
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
  User.getUserByUsername(username, (err, user) => {
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

UserSchema.pre('deleteOne', function(next){
  Membership.deleteMany({user: this._conditions._id}).exec();
  ChatRequest.deleteMany({user: this._conditions._id}).exec();
  Subscription.deleteMany({user: this._conditions._id}).exec();
  Notification.Notification.deleteMany({user: this._conditions._id}).exec();
  next();
})


const User = mongoose.model('User', UserSchema);
module.exports = User;
