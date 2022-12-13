"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = exports.initDb = void 0;
require('dotenv').config();
let connection = undefined;
const initDb = () => {
    if (connection) {
        console.warn("Trying to init DB again!");
        return connection;
    }
    const mysql = require('mysql2');
    connection = mysql.createConnection(process.env.DATABASE_URL);
    connection.connect();
    return connection;
};
exports.initDb = initDb;
const getDb = () => {
    if (!connection)
        (0, exports.initDb)();
    return connection;
};
exports.getDb = getDb;
