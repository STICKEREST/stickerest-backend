import express, { Router } from 'express';
import { Database, getDb } from '../../db';
import { getHome, getUser, logOut, addFavorites, addSaved, removeFavorites, removeSaved } from '../../controllers/users.controller';
import {createStickerPack, addStickers} from '../../controllers/stickers.controllers';

const router: Router = express.Router();
const connection: Database = getDb();

router.delete('/logout', logOut());

router.get('/home', getHome(connection));

router.post('/create-sticker-pack', createStickerPack(connection));

router.post('/add-stickers', addStickers(connection));

router.get('/add-favorites-:id', addFavorites(connection));

router.get('/remove-favorites-:id', removeFavorites(connection) );

router.get('/add-saved-:id', addSaved(connection));

router.get('/remove-saved-:id', removeSaved(connection));

router.get('/:nickname', getUser(connection));

export default router; 