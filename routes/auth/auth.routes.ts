import express, { Router } from 'express';
import { Database, getDb } from '../../db';
import { getHome, getUser, logOut, addFavorites, addSaved, removeFavorites, removeSaved, updateUser, isFavorite, isSaved, mySaved } from '../../controllers/users.controller';
import {createStickerPack} from '../../controllers/stickers.controllers';

const router: Router = express.Router();
const connection: Database = getDb();

router.delete('/logout', logOut());

router.get('/home', getHome(connection));

router.post('/create-sticker-pack', createStickerPack(connection));

// router.post('/add-stickers', addStickers(connection));

router.get('/me', getUser(connection));

router.post('/update-me', updateUser(connection));

router.get('/my-saved', mySaved(connection));

router.get('/add-favorites-:id', addFavorites(connection));

router.get('/remove-favorites-:id', removeFavorites(connection) );

router.get('/is-favorites-:id', isFavorite(connection) );

router.get('/add-saved-:id', addSaved(connection));

router.get('/remove-saved-:id', removeSaved(connection));

router.get('/is-saved-:id', isSaved(connection));




export default router; 