"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../../db");
const users_controller_1 = require("../../controllers/users.controller");
const router = express_1.default.Router();
const connection = (0, db_1.getDb)();
// router.use('/create-sticker', (req,res) => {});
router.get('/:nickname', (0, users_controller_1.getUser)(connection));
router.delete('/logout', (0, users_controller_1.logOut)());
exports.default = router;
