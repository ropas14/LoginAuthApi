'use strict';
var express = require('express');
var app = express();
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var logger=require('morgan');
var MongoStore = require('connect-mongo')(session);
const port = process.env.PORT || 3000;
var db = mongoose.connection;
//Set up default mongoose connection
var mongoDB = 'mongodb://localhost:27017/LogInUsers';
mongoose.connect(mongoDB)
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: false
}));
app.use(cookieParser());
app.set('trust proxy', 1); // trust first proxy
app.use(session({
   name: 'user_sid',
   secret: "blginkeyboard",
   activeDuration: 5 * 60 * 1000,
   proxy: true,
   resave: false,
   saveUninitialized: true,
   cookie:{
      path: "/",
      httpOnly: true,
      secure: true
      //expires: new Date(253402300000000)
   }
   store: new MongoStore({
      mongooseConnection: db
   })
}));

var routes = require('./routes/router');
app.use('/', routes);

app.use(function(req,res,next){
 var _send=res.send;
 var sent=false;
 res.send=function(data){
   if (sent) return;
   _send.bind(res)(data);
   sent=true;

  };
  next();

})
// maybe this might be affecting session save not so sure
app.use(function(req, res, next)
{
   if (req.session && req.session.user)
   {
      Users.findOne(
      {
         email: req.session.user.email
      }, function(err, user)
      {
         if (user)
         {
            req.user = user;
            delete req.user.password; // delete the password from the session
            req.session.user = user; //refresh the session value
            res.locals.user = user;
         }
         // finishing processing the middleware and run the route
         next();
      });
   }
   else
   {
      next();
   }
});

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, content type, Authorization, Accept');
    next();
});


app.use(function(err, req, res, next)
{
   res.status(400).json(err);
});
app.listen(port);
console.log("Server is listening on port " + port);
module.exports = app;