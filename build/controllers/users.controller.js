// "use strict";
// var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
//     function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
//     return new (P || (P = Promise))(function (resolve, reject) {
//         function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
//         function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
//         function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
//         step((generator = generator.apply(thisArg, _arguments || [])).next());
//     });
// };
// var __importDefault = (this && this.__importDefault) || function (mod) {
//     return (mod && mod.__esModule) ? mod : { "default": mod };
// };
// Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.logOut = exports.logUser = exports.createUser = exports.getUsers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const passport_1 = __importDefault(require("passport"));
const getUsers = (connection) => {
    return (req, res) => {
        connection.query('SELECT * FROM Utilizer;', function (err, rows, fields) {
            if (err)
                throw err;
            res.send(rows);
        });
    };
};
exports.getUsers = getUsers;
const createUser = (connection) => {
    return (req, res) =>  {
        const user = req.body;
        const hashedPw = yield bcrypt_1.default.hash(user.password, 0); //salt not used atm
        connection.query(`INSERT INTO Utilizer (email,nickname, password) VALUES ('${user.email}', '${user.nickname}','${hashedPw}');`, function (err, rows, fields) {
            if (err)
                res.send("error");
            res.send(rows);
        });
    };
};
exports.createUser = createUser;
const logUser = (connection) => {
    return (req, res, next) => {
        passport_1.default.authenticate("local", (error, user, info) => {
            if (!user)
                return res.status(401).json({
                    message: "username or password is not matched"
                });
            req.login(user, (err) => {
                if (err)
                    throw err;
                res.status(201).json("Successfully logged in!");
            });
        })(req, res, next);
    };
};
exports.logUser = logUser;
const logOut = () => {
    return (req, res, next) => {
        req.logout(function (err) {
            if (err) {
                return next(err);
            }
            res.status(204).json("Successfully loged out");
        });
    };
};
exports.logOut = logOut;
const getUser = (connection) => {
    return (req, res) => {
        const { nickname } = req.params;
        connection.query(`SELECT * FROM Utilizer U WHERE U.nickname = '${nickname}';`, function (err, rows, fields) {
            if (err)
                throw err;
            console.log(rows);
            res.send(rows);
        });
    };
};
exports.getUser = getUser;
// export const deleteUser = (connection : Database) : any => {
//     return (req : any, res : any) : void => {
//         const { nickname } = req.params;
//         connection.query(
//             `DELETE FROM Utilizer U WHERE U.nickname = '${nickname}';`, 
//             function (err: any, rows: any, fields: any) {
//                 if (err) throw err
//                 res.send(rows)
//             })
//     }
// }
// export const updateUser = (connection : Database) : any => {
//     return (req : any, res : any) : void => {
//         const { nickname } = req.params;
//         const { email, password } = req.body; 
//         let updates : string[] = [];
//         if(email)
//             updates.push(`U.email = '${email}'`);
//         if(password)
//             updates.push(`U.password = '${password}'`);
//         const query : string = updates.reduce((acc : string, update : string, index : number) => 
//                                             acc = acc + update + (index !== updates.length-1 ? "," : "")
//                                         ,"");
//         if(updates.length != 0)
//             connection.query(
//                 `UPDATE Utilizer U SET ${query} WHERE U.nickname = '${nickname}';`, 
//                 function (err: any, rows: any, fields: any) {
//                     if (err) throw err
//                     res.send(rows)
//                 })
//         else
//             res.send("No modifications have been made");
//     }
// }
