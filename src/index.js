const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const modulePath = path.join(__dirname, 'modules');
const resources = fs.readdirSync(modulePath);

const app = express();

const API = require('./classes/api');
const Authentication = require('./classes/authentication');

const JWT = require('jsonwebtoken');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;

var Store = require('./modules/stores/model');

var opts = {};

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

opts.secretOrKey = JWT_SECRET;
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
   var userId = jwt_payload.sub;
  // fetch user from database
  // var user = ... User.findById(subject) ;
  var user = { name: 'steve', email: 'email@steve', id: userId };
  done(null, user);
}));

app.use(passport.initialize());
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({
  type: ['application/json', 'application/vnd.api+json']
}));

app.get('/v1', function (request, response) {
  response.json(API.index());
});

app.post('/signup', function(request, response) {
  var token = JWT.sign({ sub: 'userId' }, JWT_SECRET );
  response.json({ token: token });
});

app.get('/', function (request, response) {
  response.redirect('/v1');
});

app.use(passport.authenticate('jwt', { session: false }));
// authenticated endpoints below

// To make a authenticated requests, the header must contains
// Authorization: JWT <YOUR JWT TOKEN>

resources.forEach(function (resource) {
  API.register(resource);
  app.use(API.endpoint(resource));
});

app.get('/sessions', function (request, response) {
  response.set('Content-Type', 'application/json');
  response.send(JSON.stringify(API.index(), null, 2));
});

module.exports = app;
