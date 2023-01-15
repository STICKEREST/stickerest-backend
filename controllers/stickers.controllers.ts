import { Database } from "../db";
import bcrypt, { hash } from 'bcrypt';
import { ExecException } from "child_process";
import passport from "passport";
import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';


const cloudinary = require('cloudinary').v2;

var fs = require('fs');



export const createStickerPack = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {
        const email : string = res.locals.user.email;
        const sticker : any = req.body;
        let yourDate = new Date()
        const today : string = yourDate.toISOString().split('T')[0];

        //@ts-ignore
        const images : any = Object.values(req.files);
        
        const tags : string[] = sticker.tag; 
    
        connection.query(
            `INSERT INTO WhatsappStickerPack (nr_downloads, price_digital, name, Designer, dt_upload, nr_sold, physical_price, link)
            VALUES (0, 00.00, '${sticker.name}', '${email}', '${today}', NULL, NULL, NULL);`, 
            function (err: any, rows: any, fields: any) {
                if (err) throw err

                // console.log(rows);
            
                // res.send(`${sticker.name} added by ${email} successfully`);

                connection.query(
                    `SELECT ID FROM WhatsappStickerPack WHERE name='${sticker.name}' AND Designer='${email}' AND dt_upload = '${today}' AND ID NOT IN (SELECT DISTINCT I.ID FROM Image I) LIMIT 1;`, 
                    function (err: any, rows: any, fields: any) {
                        if (err) throw err
        
                        const ID = rows[0].ID;
                        
                        let error : undefined | string = undefined;
                                          
                        if(tags)
                            for(let i : number = 0; i < tags.length; i++) {
        
                                connection.query(
                                    `INSERT INTO Tags (ID, tag)
                                    VALUES (${ID}, '${tags[i]}');`,
                                    function (err: any, rows: any, fields: any) {
                                        if (err) 
                                            if(error)
                                                error += err;
                                            else 
                                                error = err;
                        
                                    })
        
                            }
                        
                        for(let i = 0; i < images.length; i++) {
                            const image = images[i];
        
                            const uploadPath = "./public/files/temp/" + image.name;
                            image.mv(uploadPath, function(err: any) {
                                if (err)
                                console.log("Error");
        
                                cloudinary.uploader
                                .upload(uploadPath)
                                .then((info: any) => {
                                    const url = info.secure_url;
                    
                                    console.log("Image " + i + " has been uploaded at " + url);
        
                                    fs.unlinkSync(uploadPath);
                    
                                    connection.query(
                                                `INSERT INTO Image (ID, ordinal_order, image_file)
                                                VALUES (${ID}, ${i}, '${url}');`,
                                                function (err: any, rows: any, fields: any) {
                                                    if (err) 
                                                        if(error)
                                                            error += err;
                                                        else 
                                                            error = err;
                                    
                                                    // console.log(rows);
                                                    
                                                })
                                })
                                .catch((error: any) => {
                                    fs.unlinkSync(uploadPath);
                                    console.log(error)});
        
                            });
        
                        
                    
                        }
        
                    
                        res.send(`The creation of the pack ${sticker.name} made by ${email} was successful`);
        
        
                });

            });
            
        

        
    }

}


// //TODO: it must throw err if there are already stickers
// export const addStickers = (connection: Database) : any => {

//     return (req : Request, res : Response) : void => {
//         const sticker : any = req.body;
        
//         //@ts-ignore
//         const images : any = Object.values(req.files);
        
//         const ID = sticker.ID;
//         const email : string = res.locals.user.email;
        
//         let error : undefined | string = undefined;
        
//         const tags : string[] = sticker.tag;

//         if(tags)
//             for(let i : number = 0; i < tags.length; i++) {

//                 connection.query(
//                     `INSERT INTO Tags (ID, tag)
//                     VALUES (${sticker.ID}, '${tags[i]}');`,
//                     function (err: any, rows: any, fields: any) {
//                         if (err) 
//                             if(error)
//                                 error += err;
//                             else 
//                                 error = err;
        
//                     })

//             }
//         // console.log("Images ARE " + JSON.stringify(images));
        
//         for(let i = 0; i < images.length; i++) {
//             const image = images[i];

//             console.log(image);
//             const uploadPath = "./public/files/temp/" + image.name;
//             console.log(uploadPath);
//             image.mv(uploadPath, function(err: any) {
//                 if (err)
//                   console.log("Error");

//                 cloudinary.uploader
//                 .upload(uploadPath)
//                 .then((info: any) => {
//                     const url = info.secure_url;
    
//                     console.log("Image " + i + " has been uploaded at " + url);

//                     fs.unlinkSync(uploadPath);
    
//                     connection.query(
//                                 `INSERT INTO Image (ID, ordinal_order, image_file)
//                                 VALUES (${ID}, ${i}, '${url}');`,
//                                 function (err: any, rows: any, fields: any) {
//                                     if (err) 
//                                         if(error)
//                                             error += err;
//                                         else 
//                                             error = err;
                    
//                                     // console.log(rows);
                                    
//                                 })
//                 })
//                 .catch((error: any) => console.log(error));

//               });

           
    
//         }

    
//         res.send(`Stickers and tags added by ${email} successfully ` + error !== undefined  ? ` with the error: ${error} ` : ` `);


//     }

// }

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

export const getRandomStickerPack = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {

        connection.query(
            `SELECT MAX(ID) AS ID FROM WhatsappStickerPack;`, 
            function (err: any, rows: any, fields: any) {
                if (err) throw err

                console.log(rows);
            
                const id : number = Math.floor(Math.random() * (rows[0].ID - 1 + 1) + 1); 

                console.log(id);

                connection.query(
                    `SELECT W.ID, name, image_file as logo FROM Image I, WhatsappStickerPack W WHERE I.ID = W.ID AND I.ordinal_order = 0 AND W.ID = ${id};`, 
                    function (err: any, rows: any, fields: any) {
                        if (err) throw err
        
                        console.log(rows);

                        if(rows.length === 0) {

                            connection.query(
                                `SELECT name FROM WhatsappStickerPack WHERE ID = ${id};`, 
                                function (err: any, rows: any, fields: any) {
                                    if (err) throw err
                    
                                    res.send([{ID: id, name : rows[0].name, logo : ''}]);
                                })

                        } else {
                            res.send(rows);
                        }
                    
                        
                    })
            })
    
    }

}

export const getStickers = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {

        const { id } = req.params;
    
        connection.query(
            `SELECT * FROM Image WHERE ID = ${id};`, 
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
            `
            SELECT W.ID, name, nr_downloads, Designer, dt_upload, X.logo, COUNT(I.ordinal_order) as n_stickers FROM (SELECT image_file as logo FROM Image II WHERE II.ID = ${id} AND ordinal_order = 0) X, Image I, WhatsappStickerPack W WHERE I.ID = W.ID AND W.ID = ${id};`, 
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