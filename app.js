var express = require('express');
var http = require("http");
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')

var ActionSet = require('./actions/ActionSet');

var routes = require('./routes/index');
var users = require('./routes/users');

var response = http.ServerResponse.prototype
var _json = response.json;

response.json = function(json) {
  console.log(`JSON: ${JSON.stringify(json, null, '  ')}`);
  _json.call(this, json);
};

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.use((req, res, next) => {
  if(!req.session.hasOwnProperty('actions'))
    req.session.actions = {};
  
  if(req.session.hasOwnProperty('action_data')) {
    Object.keys(req.session.action_data)
      .forEach(key => {
        req.session.actions[key] = new ActionSet(req.session.action_data[key], true);
      });
  }
  else {
    req.session.action_data = {};
  }
  var _json = res.json;

  res.json = function(json){
    Object.keys(req.session.actions)
      .forEach(key => {
        req.session.action_data[key] = req.session.actions[key].serialize();   
      });

    req.session.actions = {};
    req.session.save();

    return _json.call(this, json);
  }

  next();
});

app.use((req, res, next) => {
  req.session.theme = `star-wars`;
  next();
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
