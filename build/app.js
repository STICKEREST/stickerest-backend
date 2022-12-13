"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const db_1 = require("./db");
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth/auth.routes"));
const passport_1 = __importDefault(require("passport"));
const passport_middleware_1 = require("./middlewares/passport.middleware");
const session_middleware_1 = require("./middlewares/session.middleware");
require('dotenv').config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
(0, passport_middleware_1.setupPassport)();
const connection = (0, db_1.getDb)();
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use(session_middleware_1.sessionMiddleware);
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// app.get("/api/demo", (req,res) => {
//   console.log(req.isAuthenticated());
//   res.json({sessionId : req.sessionID});
// })
app.use('/users', users_routes_1.default);
app.use('/auth', session_middleware_1.checkAuthentication, auth_routes_1.default);
app.get('/', (req, res) => res.send('Hello from Homepage'));
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
