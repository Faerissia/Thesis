const express = require('express');
const routes = require('./routes');
const http = require('http');
const path = require('path');
const session = require('express-session');
const app = express();
const mysql = require('mysql');
let bodyParser=require("body-parser");
let flash = require('express-flash');
const dbConnection = require('./util/db');


dbConnection.connect();
global.db = dbConnection;
 

//routes variable
const account = require('./routes/account')
const user = require('./routes/user');
const uni = require('./routes/uni');
const faculty = require('./routes/faculty');
const sport = require('./routes/sport');
const place = require('./routes/place');


// all environments
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'))

// app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
              secret: 'secret',
              resave: 'true',
              saveUninitialized: true,
              cookie: { maxAge: 60000 }
            }))
app.use(flash());

//routes
app.use('/account', account);
app.use('/uni', uni);
app.use('/faculty',faculty);
app.use('/sport',sport);
app.use('/place',place);

// development only
app.get('/', routes.index);//call for main index page
app.get('/signup', user.signup);//call for signup page
app.post('/signup', user.signup);//call for signup post 
app.get('/login', routes.index);//call for login page
app.post('/login', user.login);//call for login post
app.get('/home/dashboard', user.dashboard);//call for dashboard page after login
app.get('/home/logout', user.logout);//call for logout
app.get('/home/profile',user.profile);//to render users profile

//Middleware
app.listen(3000)
