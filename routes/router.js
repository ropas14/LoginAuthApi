var express = require('express');
var router = express.Router();
var Users = require('../model/data');
var session = require('express-session');
const {google} = require('googleapis');
const plus = google.plus('v1');
var shortid = require('shortid');


function requiresLogin(req, res, next)
{
   if ( req.session.user)
   {
      return next();
   }
   else
   {
      var err = new Error('You must be logged in to view this page.');
      err.status = 401;
      return next(err);
   }
}

var clientId='131519218626-ti537rrb7lnrt5m9qof45hfregh55s9d.apps.googleusercontent.com';
var clientSecret='859ZEgBFt_v21TN2E5WDrrIu';
var redirectUrl='http://localhost:3000/users/oauthggle';

const oauth2Client = new google.auth.OAuth2(clientId,clientSecret,redirectUrl);

// generate a url that asks permissions for Google+ and Google Calendar scopes
const scopes = [
  'https://www.googleapis.com/auth/plus.me'
];

const url = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',

  // If you only need one scope you can pass it as a string
  scope: scopes
});

router.get('/url', function(req, res){
 res.send(url)
});

router.get("/tokens", function(req, res) {

  var code = req.query.code;

  console.log(code);

  oauth2Client.getToken(code, function(err, tokens) {
    if (err) {
      console.log(err);
      res.send(err);
      return;
    }

    console.log("allright!!!!");

    console.log(err);
    console.log(tokens);
    oauth2Client.setCredentials(tokens);

    res.send(tokens);
  });
});

router.get("/users/oauthggle", function (req, res) {    
    var session = req.session;
    var code = req.query.code;
    oauth2Client.getToken(code, function(err, tokens) {
      // Now tokens contains an access_token and an optional refresh_token. Save them.
      if(!err) {
        oauth2Client.setCredentials(tokens);
        session["tokens"]=tokens;
        res.send(`
            <h3>Login successful!!</h3>
            <a href="/details">Go to details page</a>
        `);
      }
      else{
        res.send(`
            <h3>Login failed!!</h3>
        `);
      }
    });
});
 
app.use("/users/details", function (req, res) {   
    oauth2Client.setCredentials(req.session["tokens"]);
 
    var p = new Promise(function (resolve, reject) {
        plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, response) {
            resolve(response || err);
        });
    }).then(function (data) {
        res.send(`
            <img src=${data.image.url} />;
            <h3>Hello ${data.displayName}</h3>
        `);
    })
});

router.use("/", function (req, res) {
    res.send(`
       <h1>Authentication using google oAuth</h1>
       <a href=${url}>Login</a>
    `)
});

// GET route after registering
router.get('/users/profile',requiresLogin, function(req, res, next)
{ 

   console.log(req.session.user);
   return res.status(200).send('Welcome to your profile');
});

//POST route for updating data
router.post('/users/signUp', function(req, res, next)
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
       // saving session, but dont know why on redirection its not saved		 
		 req.session.save((err) => {
                if (!err) {
                    console.log(req.session);
                    return res.send('successful signUp');
                   //return res.redirect('/profile');
                }
            });
         
         }
      });

   }
   else{
      var err = new Error('All fields have to be filled out');
      err.status = 400;
      return next(err);
   }

});



//GET /logout
router.get('/users/logout', function(req, res, next)
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
router.post('/users/login', function(req, res,next)
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
        // sets a cookie with the user's info
         req.session.user = user;
         req.session.admin = true;
        
		 // saving session, but dont know why on redirection its not save
         req.session.save((err) => {
                if (!err) {
                    console.log(req.session);
                    //res.status(200).send();
                    res.redirect("/users/profile");
                }
            });
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