const express = require('express');
var bodyParser = require('body-parser')
const path = require('path');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

mongoose.connect(config.database);
let db = mongoose.connection;

// Check connection
db.once('open', function(){
  console.log('Connected to Mongodb');
});

// Check for DB errors
db.on('error', function(err){
  console.log(err);
});

// Init App
const app = express();

// Bring in Models
let Article = require('./models/article');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
// In this example, the formParam value is going to get morphed into form body format useful for printing.
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Passport config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

// Home Route
app.get('/', function(req, res){
  let articles = Article.find({}, function(err, articles){
    if (err) {
      console.log(err);
    } else {
      res.render('index', {
        title:'Articles',
        articles: articles
      });
    }
  });
  /*
  let articles = [
    {
      id:1,
      title:'Article One',
      author:'Brad Traversy',
      body:'This is article one'
    },
    {
      id:2,
      title:'Article Two',
      author:'John Ho',
      body:'This is article two'
    },
    {
      id:3,
      title:'Article Three',
      author:'John Ho',
      body:'This is article three'
    },
    {
      id:4,
      title:'Article Four',
      author:'John Ho',
      body:'This is article four'
    },
  ];
  */
});

// Product Route
app.get('/articles/products', function(req, res){
  res.render('products', {
    title:'Create Products'
  });
});

// Route Files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);


// Start Server
app.listen(3000, function(){
  console.log('Server started on port 3000...');
});
