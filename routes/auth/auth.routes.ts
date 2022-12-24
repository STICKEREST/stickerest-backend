import express, { Router } from 'express';
import { Database, getDb } from '../../db';
import { getHome, getUser, logOut } from '../../controllers/users.controller';
import {createStickerPack, addStickers} from '../../controllers/stickers.controllers';

const router: Router = express.Router();
const connection: Database = getDb();

router.delete('/logout', logOut());

router.get('/home', getHome(connection));

router.post('/create-sticker-pack', createStickerPack(connection));

router.post('/add-stickers', addStickers(connection));

router.get('/:nickname', getUser(connection));

export default router; 