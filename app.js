const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const ActionSet = require('./actions/ActionSet');

const routes = require('./routes/index');
const users = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

app.use((req, res, next) => {
  const setValue = function setValue(key, value) {
    req[key] = value; // eslint-disable-line no-param-reassign
  };

  const setSessionValue = function setSessionValue(key, value) {
    req.session[key] = value; // eslint-disable-line no-param-reassign
  };

  const createActionSet = function createActionSet(key, parse = false) {
    req.session.actions[key] = new ActionSet(key, parse); // eslint-disable-line no-param-reassign
  };

  req.setValue = setValue; // eslint-disable-line no-param-reassign
  req.setSessionValue = setSessionValue; // eslint-disable-line no-param-reassign
  req.createActionSet = createActionSet; // eslint-disable-line no-param-reassign

  next();
});

app.use((req, res, next) => {
  if (!req.session.hasOwnProperty('actions')) {
    req.setSessionValue('actions', {});
  }

  if (req.session.hasOwnProperty('action_data')) {
    Object
      .keys(req.session.action_data)
      .forEach(key => req.createActionSet(req.session.action_data[key], true));
  } else {
    req.setSessionValue('action_data', {});
  }

  const originalJsonRes = res.json;

  // eslint-disable-next-line no-param-reassign
  res.json = function json2(json) {
    Object.keys(req.session.actions)
      .forEach((key) => {
        const actionData = req.session.action_data;
        actionData[key] = req.session.actions[key].serialize();
        req.setSessionValue('action_data', actionData);
      });

    req.setSessionValue('actions', {});
    req.session.save();

    return originalJsonRes.call(this, json);
  };

  next();
});

app.use((req, res, next) => {
  req.setSessionValue('theme', 'star-wars');
  next();
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});


module.exports = app;
