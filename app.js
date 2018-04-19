'use strict';
var express = require('express');
var session = require('express-session');
var mongoose = require('mongoose');
var db = mongoose.connection;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoStore = require('connect-mongo')(session);
const port = process.env.PORT || 3000;
var app = express();

//Set up default mongoose connection
var mongoDB = 'mongodb://localhost:27017/LogInUsers';
mongoose.connect(mongoDB)
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('trust proxy', 1) // trust first proxy
app.use(session({
	/*genid:function(req) {
    return genuuid(); // use UUIDs for session IDs 
    },*/
	name:'connect.sid',
    secret:'keyboard cat',
    proxy: true,
    resave: true,
    saveUninitialized: false,
	cookie: { secure: true , 
	       expires: new Date(253402300000000)
		   },
	store: new MongoStore({
    mongooseConnection: db
  })
}));
   

// include routes
var routes = require('./routes/router');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});

app.use(function (err, req, res, next) {
  res.status(400).json(err);
});

app.listen(port);
console.log("Server is listening on port " + port );
module.exports = app;