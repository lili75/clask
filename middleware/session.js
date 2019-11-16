'use strict';

/**
 * Module dependencies.
 */
import session from 'express-session';
const MongoStore = require('connect-mongo')(session);
import mongooseConnection from '../db/connection';
import { isProduction, sessionSecret } from '../config/';

/**
 * Export session middleware.
 *
 * https://github.com/expressjs/session
 */
export default session({
    name: 'sid',
    secret: sessionSecret,
    cookie: {
        secure: isProduction,
        httpOnly: isProduction
    },
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection }),
    unset: 'destroy'
});
