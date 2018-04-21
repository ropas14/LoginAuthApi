var express = require('express');
var router = express.Router();
var Users = require('../model/data');
var session = require('express-session');
var shortid = require('shortid');

/*function requiresLogin(req, res, next)
{
    
   if (req.session && req.session.user&& req.session.admin)
   {
     return next();
   }
   else
   {
      var err = new Error('You must be logged in to view this page.');
      err.status = 401;
      return next(err);
   }
   
}*/

// GET route after registering
router.get('/profile',  function(req, res, next)
{ if(!req.session.user){

      return res.status(401).send('You must be logged in to view this page.');
   }
   return res.status(200).send('Welcome to your profile');
});

//POST route for updating data
router.post('/signUp', function(req, res, next)
{
   // confirm that user typed same password twice
   if (req.body.password !== req.body.passwordConf)
   {
      var err = new Error('Passwords do not match.');
      err.status = 400;
      return next(err);
   }

   if (req.body.email &&req.body.username &&
      req.body.password &&
      req.body.phone){

      var userData = {
         email: req.body.email,
         username: req.body.username,
         password: req.body.password,
         phone: req.body.phone,
         access_token: shortid.generate()
      }

      //use schema.create to insert data into the db
      Users.create(userData, function(err, user)
      {
         if (err){
            return next(err)
         }
         else{        
         req.session.user = user;
         req.session.admin = true;
         return res.send("successful signup");
         //return res.redirect('/profile');
         }
      });

   }
   else{
      var err = new Error('All fields have to be filled out');
      err.status = 400;
      return next(err);
   }

});

// POST route after registering
router.post('/profile', function(req, res, next)
{

   return res.send('POST profile');
});

//GET /logout
router.get('/logout', function(req, res, next)
{
   if (req.session){
      // delete session object
      req.session.destroy(function(err)
      {
         if (err){
            return next(err);
         }
         else{
            return res.send("Logged Out");
         }
      });
   }
});


// Login user
router.post('/users/login', function(req, res)
{
   var email = req.body.email;
   var password = req.body.password;

   if (email.length > 0 && password.length > 0)
   {
      Users.authenticate(email, password, function(err, user)
      {
         if (err){
            res.json({
               status: 0,
               message: err
            });
         }
         if (!user){
			 res.json({
               status: 0,
               msg: "user not found"
            });
         }
         req.session.userId = user._id;
         req.session.user = user;
         req.session.admin = true;
         res.json({
            status: 1,
            id: user._id,
            message: " successfully logged in"
         });
       //res.redirect('/profile');
      })
   }
   else{
      res.json({
         status: 0,
         msg: "Invalid Fields"
      });
   }
});

module.exports = router;