import { Database } from "../db";
import bcrypt, { hash } from 'bcrypt';
import { ExecException } from "child_process";
import passport from "passport";
import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';


const cloudinary = require('cloudinary').v2;

var fs = require('fs');

const sharp = require('sharp');

export const createStickerPack = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {
        const email : string = res.locals.user.email;
        const sticker : any = req.body;
        let yourDate = new Date()
        const today : string = yourDate.toISOString().split('T')[0];

        //@ts-ignore
        const images : any = Object.values(req.files);
        
        const tags : string[] = typeof sticker.tag === "string" ? [sticker.tag] : sticker.tag;
    
        connection.promise().query(
            `INSERT INTO WhatsappStickerPack (nr_downloads, price_digital, name, Designer, dt_upload, nr_sold, physical_price, link)
            VALUES (0, 00.00, '${sticker.name}', '${email}', '${today}', NULL, NULL, NULL);`)
        .then(([rows, fields] : [rows : any, fields : any]) => {

            connection.promise().query(
                `SELECT ID FROM WhatsappStickerPack WHERE name='${sticker.name}' AND Designer='${email}' AND dt_upload = '${today}' AND ID NOT IN (SELECT DISTINCT I.ID FROM Image I) LIMIT 1;`
            ).then(async ([rows, fields] : [rows : any, fields : any]) : Promise<number> => {

                const ID = rows[0].ID;
                        
                let error : undefined | string = undefined;

                if(tags) {
                    await Promise.all(tags.map( (tag : string) =>  
                            connection.promise().query(
                            `INSERT INTO Tags (ID, tag)
                            VALUES (${ID}, '${tag}');`)
                        )
                    );
                }

                await Promise.all(images.map( async (imageElement : any, i : number) => {

                        const image = imageElement;

                        const uploadPath = "./public/files/temp/" + image.name;
                        const outputPath = "./public/files/output/" + image.name.split(".")[0] + ".png";
                        await image.mv(uploadPath);

                        await sharp(uploadPath)
                        .png({ quality: 30 })
                        .resize(512, 512, {
                            fit: sharp.fit.contain
                        })
                        .toFile(outputPath)
                        .then(async (res: any) => {

                            try {

                                await cloudinary.uploader
                                .upload(outputPath)
                                .then(async (info: any) => {
                                    const url = info.secure_url;
        
                                    fs.unlinkSync(uploadPath);
                                    fs.unlinkSync(outputPath);
                    
                                    await connection.promise().query(
                                        `INSERT INTO Image (ID, ordinal_order, image_file)
                                        VALUES (${ID}, ${i}, '${url}');`
                                    )
                                })
                                .catch((error: any) => {
                                    fs.unlinkSync(uploadPath);
                                    fs.unlinkSync(outputPath);
                                    console.log(error)
                                });

                            } catch (err : any) {

                                console.log("Error");
                                fs.unlinkSync(uploadPath);
                                fs.unlinkSync(outputPath);

                            }                                            

                        });

                    }
                ));

                return ID;              

            }).then((ID : number) => {
                res.send({
                    ID: ID
                });
            })

        });

        
    }

}


export const addTelegram = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {

        const email : string = res.locals.user.email;
        const { id } = req.params;
        const telegramName : string = req.body.telegramName;
    
        connection.query(
            `UPDATE WhatsappStickerPack SET telegram_name = '${telegramName}' WHERE Designer = '${email}' AND id = ${id}`, 
            function (err: any, rows: any, fields: any) {
                if (err) res.status(500).send();
            
                res.send(rows);
            })
    }

}



export const getStickerPacks = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {
    
        connection.query(
            `SELECT W.ID, name, nr_downloads, image_file as logo, Designer, dt_upload FROM Image I, WhatsappStickerPack W WHERE I.ID = W.ID AND I.ordinal_order = 0;`, 
            function (err: any, rows: any, fields: any) {
                if (err) res.status(500).send();
            
                res.send(rows);
            })
    }

}

export const getRandomStickerPack = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {

        connection.query(
            `SELECT MAX(ID) AS ID FROM WhatsappStickerPack;`, 
            function (err: any, rows: any, fields: any) {
                if (err) res.status(500).send();
                
                //changed to 127 because its the first sticker pack with images and all of the following have images as well
                const id : number = Math.floor(Math.random() * (rows[0].ID - 127 + 1) + 127); 

                connection.query(
                    `SELECT W.ID, name, image_file as logo FROM Image I, WhatsappStickerPack W WHERE I.ID = W.ID AND I.ordinal_order = 0 AND W.ID = ${id};`, 
                    function (err: any, rows: any, fields: any) {
                        if (err) res.status(500).send();

                        if(rows.length === 0) {

                            connection.query(
                                `SELECT name FROM WhatsappStickerPack WHERE ID = ${id};`, 
                                function (err: any, rows: any, fields: any) {
                                    if (err) res.status(500).send();
                    
                                    res.send([{ID: id, name : rows[0].name, logo : ''}]);
                                })

                        } else {
                            res.send(rows);
                        }
                    
                        
                    })
            })
    
    }

}

export const getStickerPackByName = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {

        const { name } = req.params;
    
        connection.query(
            `SELECT W.ID, name, image_file as logo FROM Image I, WhatsappStickerPack W WHERE I.ID = W.ID AND I.ordinal_order = 0 AND W.name LIKE '%${name}%';`, 
            function (err: any, rows: any, fields: any) {
                if (err) res.status(500).send();
            
                res.send(rows);
            })
    }

}

export const getStickerPackByTags = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {

        const { tag } = req.params;
    
        connection.query(
            `SELECT W.ID, name, nr_downloads, image_file as logo, Designer, dt_upload FROM Image I, WhatsappStickerPack W WHERE I.ID = W.ID AND I.ordinal_order = 0 AND W.ID IN (SELECT DISTINCT ID FROM Tags WHERE tag LIKE '%${tag}%');`, 
            function (err: any, rows: any, fields: any) {
                if (err) res.status(500).send();
            
                res.send(rows);
            })
    }

}


export const getStickers = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {

        const { id } = req.params;
    
        connection.query(
            `SELECT * FROM Image WHERE ID = ${id};`, 
            function (err: any, rows: any, fields: any) {
                if (err) res.status(500).send();
            
                res.send(rows);
            })
    }

}

export const getStickerPack = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {

        const { id } = req.params;
    
        connection.query(
            `
            SELECT W.ID, name, nr_downloads, telegram_name, Designer, dt_upload, X.logo, COUNT(I.ordinal_order) as n_stickers FROM (SELECT image_file as logo FROM Image II WHERE II.ID = ${id} AND ordinal_order = 0) X, Image I, WhatsappStickerPack W WHERE I.ID = W.ID AND W.ID = ${id};`, 
            function (err: any, rows: any, fields: any) {
                if (err) res.status(500).send();
            
                res.send(rows);
            })
    }

}

export const getMostDownloaded = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {

        connection.query(
            `SELECT W.ID, name, nr_downloads, image_file as logo, Designer, dt_upload FROM Image I, WhatsappStickerPack W WHERE I.ID = W.ID AND I.ordinal_order = 0 ORDER BY nr_downloads DESC LIMIT 7;`, 
            function (err: any, rows: any, fields: any) {
                if (err) res.status(500).send();
            
                res.send(rows);
            })
    }

}

export const getMostFavorited = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {

        connection.query(
            `SELECT W.ID, COUNT(W.ID) AS nr_fav, name, nr_downloads, image_file as logo, Designer, dt_upload FROM Image I, WhatsappStickerPack W, Favorites F WHERE W.ID = F.ID AND W.ID = I.ID AND ordinal_order=0 GROUP BY W.ID, name, nr_downloads, logo, Designer, dt_upload ORDER BY nr_fav DESC LIMIT 7;`, 
            function (err: any, rows: any, fields: any) {
                if (err) res.status(500).send();
            
                res.send(rows);
            })
    }

}

export const getMostSaved = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {

        connection.query(
            `SELECT W.ID, COUNT(W.ID) AS nr_saved, name, nr_downloads, image_file as logo, Designer, dt_upload FROM Image I, WhatsappStickerPack W, Saved S WHERE W.ID = S.ID AND W.ID = I.ID AND ordinal_order=0 GROUP BY W.ID, name, nr_downloads, logo, Designer, dt_upload ORDER BY nr_saved DESC LIMIT 7;`, 
            function (err: any, rows: any, fields: any) {
                if (err) res.status(500).send();
            
                res.send(rows);
            })
    }

}

export const addDownload =  (connection: Database) : any => {

    return (req : Request, res : Response) : void => {

        const { id } = req.params;
    
        connection.query(
            `UPDATE WhatsappStickerPack SET nr_downloads = (nr_downloads + 1) WHERE ID = ${id};`, 
            function (err: any, rows: any, fields: any) {
                if (err) res.status(500).send();
            
                res.send(rows);
            })
    }

}