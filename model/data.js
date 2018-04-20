var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
const joi = require('joi');
const joigoose = require('joigoose')(mongoose);
var SALT_WORK_FACTOR = 10;
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

const joiSchema = joi.object().keys(
{
   email: joi.string().email().required(),
   username: joi.string().alphanum().min(3).max(30).required(),
   password: [joi.string(), joi.number()],
   access_token: [joi.string(), joi.number()],
   phone: joi.string().regex(/^[0-9]{8,30}$/).required(),
})

var UserSchema = new mongoose.Schema(joigoose.convert(joiSchema));

//authenticate input against database
UserSchema.statics.authenticate = function(email, password, callback)
{
   Users.findOne({  email: email}).exec(function(err, user){
         if (err) {
            return callback(err)
         }
         else if (!user){
            var err = new Error('User not found.');
            err.status = 401;
            return callback(err);
         }
         bcrypt.compare(password, user.password, function(err, result)
         {
            if (result === true){
               return callback(null, user);
            }
            else{
               return callback();
            }
         })
      });
}

UserSchema.pre('save', function(next)
{
   var user = this;

   // only hash the password if it has been modified (or is new)
   if (!user.isModified('password')) return next();

   // generate a salt
   bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt)
   {
      if (err) return next(err);

      // hash the password using our new salt
      bcrypt.hash(user.password, salt, function(err, hash)
      {
         if (err) return next(err);

         // override the password with the hashed one
         user.password = hash;
         next();
      });
   });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb)
{
   bcrypt.compare(candidatePassword, this.password, function(err, isMatch)
   {
      if (err) return cb(err);
      cb(null, isMatch);
   });
}

var Users = mongoose.model('Users', UserSchema);
module.exports = Users;
module.exports.closeConnection = function()
{
   db.close();
}