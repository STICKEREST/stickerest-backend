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
            
                res.send(rows)
            })
    }

}

export const updateUser = (connection : Database) : any => {
        return (req : any, res : any) : void => {
            const { nickname } = req.body; 
            const email = res.locals.user.email;
        
            connection.query(
                `UPDATE Utilizer U SET U.nickname = '${nickname}' WHERE U.email = '${email}';`, 
                function (err: any, rows: any, fields: any) {
                    if (err) throw err
                
                    res.send(rows)
                })
        }
    }

export const getHome = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {
        const email = res.locals.user.email;
    
        connection.query(
            `SELECT * FROM Utilizer U WHERE U.email = '${email}';`, 
            function (err: any, rows: any, fields: any) {
                if (err) throw err
            
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

                res.send(rows[0] !== undefined);
                
            })
    }

}

export const mySaved = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {
        const email = res.locals.user.email;
    
        connection.query(
            `SELECT W.ID, name, nr_downloads, image_file as logo, Designer, dt_upload FROM Image I, WhatsappStickerPack W, Saved S WHERE I.ID = W.ID AND S.ID = W.ID AND S.email = '${email}' AND I.ordinal_order = 0 ORDER BY nr_downloads DESC LIMIT 10;`, 
            function (err: any, rows: any, fields: any) {

                res.send(rows);
                
            })
    }

}
