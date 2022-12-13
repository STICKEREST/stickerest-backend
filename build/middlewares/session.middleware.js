"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuthentication = exports.sessionMiddleware = void 0;
const session = require('express-session');
const mysqlStore = require('express-mysql-session')(session);
const sessionMiddleware = (req, res, next) => {
    const options = {
        connectionLimit: 10,
        password: process.env.DB_PASS,
        user: process.env.DB_USER,
        database: process.env.MYSQL_DB,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        createDatabaseTable: true,
        ssl: {
            rejectUnauthorized: true,
        }
    };
    const sessionStore = new mysqlStore(options);
    return session({
        name: process.env.SESSION_NAME,
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        secret: process.env.SESSION_SECRET,
        cookie: {
            maxAge: 1000 * 60 * 60 * 2,
            sameSite: true
        }
    })(req, res, next);
};
exports.sessionMiddleware = sessionMiddleware;
const checkAuthentication = (req, res, next) => {
    if (req.isAuthenticated())
        next();
    else
        res.status(500).json("Unauthorized");
};
exports.checkAuthentication = checkAuthentication;
