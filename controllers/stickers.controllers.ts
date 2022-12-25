import { Database } from "../db";
import bcrypt, { hash } from 'bcrypt';
import { ExecException } from "child_process";
import passport from "passport";
import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';


export const createStickerPack = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {
        const email : string = res.locals.user.email;
        const sticker : any = req.body;
        let yourDate = new Date()
        const today : string = yourDate.toISOString().split('T')[0];
    
        connection.query(
            `INSERT INTO WhatsappStickerPack (nr_downloads, price_digital, name, Designer, dt_upload, nr_sold, physical_price, link)
            VALUES (0, 00.00, '${sticker.name}', '${email}', '${today}', NULL, NULL, NULL);`, 
            function (err: any, rows: any, fields: any) {
                if (err) throw err

                console.log(rows);
            
                // res.send(`${sticker.name} added by ${email} successfully`);
            });

        

        connection.query(
            `SELECT ID FROM WhatsappStickerPack WHERE name='${sticker.name}' AND Designer='${email}' AND dt_upload = '${today}' AND ID NOT IN (SELECT DISTINCT I.ID FROM Image I) LIMIT 1;`, 
            function (err: any, rows: any, fields: any) {
                if (err) throw err

                console.log(rows[0].ID);

                res.send(""+rows[0].ID);
            });

        
    }

}


//TODO: it must throw err if there are already stickers
export const addStickers = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {
        const sticker : any = req.body;
        const images : string[] = sticker.image_file;
        const ID = sticker.ID;
        const email : string = res.locals.user.email;

        let error : undefined | string = undefined;

        for(let i : number = 0; i < images.length; i++) {

            connection.query(
                `INSERT INTO Image (ID, ordinal_order, image_file)
                VALUES (${ID}, ${i}, '${images[i]}');`,
                function (err: any, rows: any, fields: any) {
                    if (err) 
                        if(error)
                            error += err;
                        else 
                            error = err;
    
                    console.log(rows);
                })

        }

        const tags : string[] = sticker.tag;

        for(let i : number = 0; i < tags.length; i++) {

            connection.query(
                `INSERT INTO Tags (ID, tag)
                VALUES (${sticker.ID}, '${tags[i]}');`,
                function (err: any, rows: any, fields: any) {
                    if (err) 
                        if(error)
                            error += err;
                        else 
                            error = err;
    
                    console.log(rows);
                })

        }
    
        res.send(`${sticker.name} added by ${email} successfully` + error ? " but with the following error: " + error : "");


    }

}

export const getStickerPacks = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {
    
        connection.query(
            `SELECT W.ID, name, nr_downloads, image_file as logo, Designer, dt_upload FROM Image I, WhatsappStickerPack W WHERE I.ID = W.ID AND I.ordinal_order = 0;`, 
            function (err: any, rows: any, fields: any) {
                if (err) throw err

                console.log(rows);
            
                res.send(rows);
            })
    }

}

export const getStickers = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {

        const { id } = req.params;
    
        connection.query(
            `SELECT * FROM Image WHERE ID = ${id}`, 
            function (err: any, rows: any, fields: any) {
                if (err) throw err

                console.log(rows);
            
                res.send(rows);
            })
    }

}

export const getStickerPack = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {

        const { id } = req.params;
    
        connection.query(
            `SELECT W.ID, name, nr_downloads, image_file as logo, Designer, dt_upload FROM Image I, WhatsappStickerPack W WHERE I.ID = W.ID AND I.ordinal_order = 0 AND W.ID = ${id};`, 
            function (err: any, rows: any, fields: any) {
                if (err) throw err

                console.log(rows);
            
                res.send(rows);
            })
    }

}

export const getMostDownloaded = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {

        connection.query(
            `SELECT W.ID, name, nr_downloads, image_file as logo, Designer, dt_upload FROM Image I, WhatsappStickerPack W WHERE I.ID = W.ID AND I.ordinal_order = 0 ORDER BY nr_downloads DESC LIMIT 10;`, 
            function (err: any, rows: any, fields: any) {
                if (err) throw err

                console.log(rows);
            
                res.send(rows);
            })
    }

}

export const getMostFavorited = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {

        connection.query(
            `SELECT W.ID, COUNT(W.ID) AS nr_fav, name, nr_downloads, image_file as logo, Designer, dt_upload FROM Image I, WhatsappStickerPack W, Favorites F WHERE W.ID = F.ID AND W.ID = I.ID AND ordinal_order=0 GROUP BY W.ID, name, nr_downloads, logo, Designer, dt_upload ORDER BY nr_fav DESC LIMIT 10;`, 
            function (err: any, rows: any, fields: any) {
                if (err) throw err

                console.log(rows);
            
                res.send(rows);
            })
    }

}

export const getMostSaved = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {

        connection.query(
            `SELECT W.ID, COUNT(W.ID) AS nr_saved, name, nr_downloads, image_file as logo, Designer, dt_upload FROM Image I, WhatsappStickerPack W, Saved S WHERE W.ID = S.ID AND W.ID = I.ID AND ordinal_order=0 GROUP BY W.ID, name, nr_downloads, logo, Designer, dt_upload ORDER BY nr_saved DESC LIMIT 10;`, 
            function (err: any, rows: any, fields: any) {
                if (err) throw err

                console.log(rows);
            
                res.send(rows);
            })
    }

}