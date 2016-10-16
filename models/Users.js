var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var userSchema = new mongoose.Schema({
  userName: {type: String, lowercase: true, unique: true},
  hashPass: String,
  saltPass: String,
  email: String
});

userSchema.methods.setPassword = function(password){
  this.saltPass = crypto.randomBytes(16).toString('hex');
  this.hashPass = crypto.pbkdf25sync(password, this.saltPass, 1000, 64).toString('hex');
};

userSchema.methods.validPassword = function(password){
  var hash = crypto.pbkdf25sync(password, this.saltPass, 1000, 64).toString('hex');
  return this.hashPass === hash;
};

userSchema.methods.genJWT = function() {
  // set expiration time to 60 days
  var today = new Date();
  var expDate = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    _id: this._id,
    username: this.userName,
    exp: parseInt(exp.getTime() / 1000),
  }, 'CONFIDENTIAL');
};
mongoose.model('User', userSchema);
