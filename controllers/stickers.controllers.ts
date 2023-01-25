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
        
        const tags : string[] = sticker.tag; 
    
        connection.query(
            `INSERT INTO WhatsappStickerPack (nr_downloads, price_digital, name, Designer, dt_upload, nr_sold, physical_price, link)
            VALUES (0, 00.00, '${sticker.name}', '${email}', '${today}', NULL, NULL, NULL);`, 
            function (err: any, rows: any, fields: any) {
                if (err) throw err

                connection.query(
                    `SELECT ID FROM WhatsappStickerPack WHERE name='${sticker.name}' AND Designer='${email}' AND dt_upload = '${today}' AND ID NOT IN (SELECT DISTINCT I.ID FROM Image I) LIMIT 1;`, 
                    function (err: any, rows: any, fields: any) {
                        if (err) throw err
        
                        const ID = rows[0].ID;
                        
                        let error : undefined | string = undefined;
                        
                        const upload = async () : Promise<void> => {

                            if(tags) {
                                tags.map( (tag : string, i : number) =>  (
                                    async () => connection.query(
                                        `INSERT INTO Tags (ID, tag)
                                        VALUES (${ID}, '${tag[i]}');`,
                                        function (err: any, rows: any, fields: any) {
                                            if (err) 
                                                if(error)
                                                    error += err;
                                                else 
                                                    error = err;
                            
                                    })
                                )).forEach(async (tagFunction : any) => {
                                    await tagFunction();
                                })
                            }

                            images.map( (imageElement : any, i : number) => (
                                async () => {

                                    const image = imageElement[i];
            
                                    const uploadPath = "./public/files/temp/" + image.name;
                                    const outputPath = "./public/files/output/" + image.name.split(".")[0] + ".webp";
                                    image.mv(uploadPath, function(err: any) {
                                        if (err) {
                                            console.log("Error");
                                            fs.unlinkSync(uploadPath);
                                        } else {

                                            try {

                                                sharp(uploadPath)
                                                .webp({ quality: 30 })
                                                .toFile(outputPath)
                                                .then((res: any) => {

                                                    try {

                                                        cloudinary.uploader
                                                        .upload(outputPath)
                                                        .then((info: any) => {
                                                            const url = info.secure_url;
                                
                                                            fs.unlinkSync(uploadPath);
                                                            fs.unlinkSync(outputPath);
                                            
                                                            connection.query(
                                                                `INSERT INTO Image (ID, ordinal_order, image_file)
                                                                VALUES (${ID}, ${i}, '${url}');`,
                                                                function (err: any, rows: any, fields: any) {
                                                                    if (err) 
                                                                        if(error)
                                                                            error += err;
                                                                        else 
                                                                            error = err;
                                                                    
                                                                })
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

                                            } catch (err : any) {
                                                console.log("Error");
                                                fs.unlinkSync(uploadPath);
                                                fs.unlinkSync(outputPath);
                                            }
                                            

                                        }
                
                                    });

                                }
                            )).forEach(async (imageUploadFunction : any) => {
                                await imageUploadFunction();
                            })
                            
                            // for(let i = 0; i < images.length; i++) {

                            //     queryPromisesUpload.push(async () : Promise<void> => {

                                    

                            //     });

                        
                            // };


                        };


                        upload().then(() => {

                            res.send({
                                ID: ID
                            });

                        })
        
                });

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
                if (err) throw err
            
                res.send(rows);
            })
    }

}



export const getStickerPacks = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {
    
        connection.query(
            `SELECT W.ID, name, nr_downloads, image_file as logo, Designer, dt_upload FROM Image I, WhatsappStickerPack W WHERE I.ID = W.ID AND I.ordinal_order = 0;`, 
            function (err: any, rows: any, fields: any) {
                if (err) throw err
            
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
                
                //changed to 56 because its the first sticker pack with images and all of the following have images as well
                const id : number = Math.floor(Math.random() * (rows[0].ID - 56 + 1) + 56); 

                connection.query(
                    `SELECT W.ID, name, image_file as logo FROM Image I, WhatsappStickerPack W WHERE I.ID = W.ID AND I.ordinal_order = 0 AND W.ID = ${id};`, 
                    function (err: any, rows: any, fields: any) {
                        if (err) throw err

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

export const getStickerPackByName = (connection: Database) : any => {

    return (req : Request, res : Response) : void => {

        const { name } = req.params;
    
        connection.query(
            `SELECT W.ID, name, image_file as logo FROM Image I, WhatsappStickerPack W WHERE I.ID = W.ID AND I.ordinal_order = 0 AND W.name LIKE '%${name}%';`, 
            function (err: any, rows: any, fields: any) {
                if (err) throw err
            
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
                if (err) throw err
            
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
                if (err) throw err
            
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
                if (err) throw err
            
                res.send(rows);
            })
    }

}