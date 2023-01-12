import { Database } from "../db";
import bcrypt, { hash } from 'bcrypt';
import { ExecException } from "child_process";
import passport from "passport";
import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';

export const getUsers = (connection: Database) : any => {
    return (req : any, res : any) : void => {
        connection.query('SELECT * FROM Utilizer;', function (err: any, rows: any, fields: any) {
          if (err) throw err
      
          res.send(rows)
        })
    }
}

export const createUser = (connection: Database) : any => {
    return async (req : any, res : any) : Promise<void> => {
        const user = req.body;

        const hashedPw = await bcrypt.hash(user.password, 0); //salt not used atm

        connection.query(
            `INSERT INTO Utilizer (email,nickname, password) VALUES ('${user.email}', '${user.nickname}','${hashedPw}');`, 
            function (err: any, rows: any, fields: any) {
                if (err) res.status(500).send();
            
                res.status(201).send();
            })
    }
}

export const logUser = (connection: Database) : any => {

    return  (req : Request, res : Response, next : NextFunction) : void => {
        passport.authenticate("local", (error, user, info) => {
            if(!user) return res.status(401).json({
                message: "username or password is not matched"
            })

            req.login(user , (err) => {
                if(err) throw err;


                res.status(201).json("Successfully logged in!");
            })
        })(req,res,next);
    }

}

export const logOut = () : any => {

    return  (req : Request, res : Response, next : NextFunction) : void => {
        req.logout(function(err) {
            if (err) { return next(err); }
            res.status(204).json("Successfully loged out");
          });
        
    }

}

export const getUser = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {
        const email = res.locals.user.email;
    
        connection.query(
            `SELECT * FROM Utilizer U WHERE U.email = '${email}';`, 
            function (err: any, rows: any, fields: any) {
                if (err) throw err

                console.log(rows);
            
                res.send(rows)
            })
    }

}

export const updateUser = (connection : Database) : any => {
        return (req : any, res : any) : void => {
            const { nickname, email } = req.body; 
        
            let updates : string[] = [];
        
            if(email)
                updates.push(`U.email = '${email}'`);
            // if(password)
            //     updates.push(`U.password = '${password}'`);
        
            const query : string = updates.reduce((acc : string, update : string, index : number) => 
                                                acc = acc + update + (index !== updates.length-1 ? "," : "")
                                            ,"");
        
            if(updates.length != 0)
                connection.query(
                    `UPDATE Utilizer U SET ${query} WHERE U.nickname = '${nickname}';`, 
                    function (err: any, rows: any, fields: any) {
                        if (err) throw err
                    
                        res.send(rows)
                    })
            else
                res.send("No modifications have been made");
        }
    }

export const getHome = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {
        const email = res.locals.user.email;
    
        connection.query(
            `SELECT * FROM Utilizer U WHERE U.email = '${email}';`, 
            function (err: any, rows: any, fields: any) {
                if (err) throw err

                console.log(rows);
            
                res.send(rows)
            })
    }

}

export const addFavorites = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {
        const { id } = req.params;
        const email = res.locals.user.email;
    
        connection.query(
            `INSERT INTO Favorites (email, ID) VALUES ('${email}', ${id})`, 
            function (err: any, rows: any, fields: any) {
                if (err) {

                    res.send("Already in saved")

                } else {

                    console.log(rows);
                    res.send(rows);

                }
                
            })
    }

}

export const removeFavorites = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {
        const { id } = req.params;
        const email = res.locals.user.email;
    
        connection.query(
            `DELETE FROM Favorites WHERE email = '${email}' AND ID = ${id}`, 
            function (err: any, rows: any, fields: any) {
                if (err) {

                    res.send("Already removed")

                } else {

                    console.log(rows);
                    res.send(rows);

                }
                
            })
    }

}

export const isFavorite = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {
        const { id } = req.params;
        const email = res.locals.user.email;
    
        connection.query(
            `SELECT * FROM Favorites WHERE email = '${email}' AND ID = ${id}`, 
            function (err: any, rows: any, fields: any) {

                console.log(rows);
                res.send(rows[0] !== undefined);
                
            })
    }

}

export const addSaved = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {
        const { id } = req.params;
        const email = res.locals.user.email;
    
        connection.query(
            `INSERT INTO Saved (email, ID) VALUES ('${email}', ${id})`, 
            function (err: any, rows: any, fields: any) {
                if (err) {

                    res.send("Already in favorites")

                } else {

                    console.log(rows);
                    res.send(rows);

                }
                
            })
    }

}

export const removeSaved = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {
        const { id } = req.params;
        const email = res.locals.user.email;
    
        connection.query(
            `DELETE FROM Saved WHERE email = '${email}' AND ID = ${id}`, 
            function (err: any, rows: any, fields: any) {
                if (err) {

                    res.send("Already removed")

                } else {

                    console.log(rows);
                    res.send(rows);

                }
                
            })
    }

}

export const isSaved = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {
        const { id } = req.params;
        const email = res.locals.user.email;
    
        connection.query(
            `SELECT * FROM Saved WHERE email = '${email}' AND ID = ${id}`, 
            function (err: any, rows: any, fields: any) {

                console.log(rows);
                res.send(rows[0] !== undefined);
                
            })
    }

}


// export const createStickerPack = (connection: Database) : any => {

//     return (req : Request, res : Response) : void => {
//         const email : string = res.locals.user.email;
//         const sticker : any = req.body;
//         let yourDate = new Date()
//         const today : string = yourDate.toISOString().split('T')[0];
    
//         connection.query(
//             `INSERT INTO WhatsappStickerPack (nr_downloads, price_digital, name, Designer, dt_upload, nr_sold, physical_price, link)
//             VALUES (0, 00.00, '${sticker.name}', '${email}', '${today}', NULL, NULL, NULL);`, 
//             function (err: any, rows: any, fields: any) {
//                 if (err) throw err

//                 console.log(rows);
            
//                 res.send(`${sticker.name} added by ${email} successfully`);
//             })
//     }

// }

// export const getHome = (connection: Database) : any => {

//     console.log('aiuto')

//     return (req : Request, res : Response) : void => {
//         const  nickname  = "12321";

//         console.log('aaaa')
    
//         connection.query(
//             `SELECT * FROM Utilizer U WHERE U.nickname = '${nickname}';`, 
//             function (err: any, rows: any, fields: any) {
//                 if (err) throw err

//                 console.log(rows);
            
//                 res.send(rows)
//             })
//     }

// }

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