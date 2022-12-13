"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupPassport = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const db_1 = require("../db");
const bcrypt_1 = __importDefault(require("bcrypt"));
let callOneTimeOnly = false;
function setupPassport() {
    const connection = (0, db_1.getDb)();
    if (callOneTimeOnly)
        return;
    passport_1.default.use(new passport_local_1.Strategy({
        usernameField: "email",
        passwordField: "password"
    }, (email, password, done) => __awaiter(this, void 0, void 0, function* () {
        function getUserByEmail(email) {
            return __awaiter(this, void 0, void 0, function* () {
                let pro = new Promise((resolve, reject) => {
                    let query = `SELECT * FROM Utilizer U WHERE U.email = '${email}';`;
                    connection.query(query, function (err, rows) {
                        if (err)
                            throw err;
                        resolve(rows[0]);
                    });
                });
                return pro.then((val) => { return val; });
            });
        }
        const user = yield getUserByEmail(email);
        // Modwel.findUsernam()
        const checkPassword = (password, passExisting) => __awaiter(this, void 0, void 0, function* () {
            return yield bcrypt_1.default.compare(password, passExisting);
        });
        if (user && (yield checkPassword(password, user.password)))
            done(null, user);
        else
            done(null, false);
    })));
    passport_1.default.serializeUser((user, done) => {
        done(null, user.email);
    });
    passport_1.default.deserializeUser((email, done) => __awaiter(this, void 0, void 0, function* () {
        function getUserByEmail(email) {
            return __awaiter(this, void 0, void 0, function* () {
                let pro = new Promise((resolve, reject) => {
                    let query = `SELECT * FROM Utilizer U WHERE U.email = '${email}';`;
                    connection.query(query, function (err, rows) {
                        if (err)
                            throw err;
                        resolve(rows[0]);
                    });
                });
                return pro.then((val) => { return val; });
            });
        }
        try {
            const user = yield getUserByEmail(email);
            done(null, user);
        }
        catch (error) {
            done(error);
        }
    }));
    callOneTimeOnly = true;
}
exports.setupPassport = setupPassport;
