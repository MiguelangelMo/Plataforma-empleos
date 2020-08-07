const mongoose = require('mongoose');
require('./config/db');

const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const router = require('./routes');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const passport = require('./config/passport');
const createError = require('http-errors');

require('dotenv').config({ path: 'variables.env' });

const app = express();

// habilitar body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(expressValidator());

// habilitar handlebars como view
app.engine('handlebars',
    exphbs({
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars')
    })
);
app.set('view engine', 'handlebars');

// static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
    res.locals.message = req.flash(),
        next()
});

app.use('/', router());

app.use((req, res, next) => {
    next(createError(404, 'No encontrado'));
});

app.use((error, req, res, next) => {
    res.locals.error = error.message;
    const status = error.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render('error');
});

const port = process.env.PORT;
const host = '0.0.0.0';
// Deploy
//app.listen(port, host)
app.listen(process.env.PUERTO);