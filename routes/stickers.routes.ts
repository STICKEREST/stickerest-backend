import express, { Router } from 'express';
import { getDb, Database } from '../db';
import { createUser, getUser, getUsers, logUser } from '../controllers/users.controller';
import { getStickerPacks, getStickers, getStickerPack, getMostDownloaded, getMostFavorited, getMostSaved, getRandomStickerPack, getStickerPackByName, getStickerPackByTags} from '../controllers/stickers.controllers';

const router: Router = express.Router();
const connection: Database = getDb();

router.get('/', getStickerPacks(connection));

router.get('/most-downloaded', getMostDownloaded(connection));

router.get('/most-favorited', getMostFavorited(connection));

router.get('/most-saved', getMostSaved(connection));

router.get('/random', getRandomStickerPack(connection));

router.get('/name-:name', getStickerPackByName(connection));

router.get('/tags-:tag', getStickerPackByTags(connection));

router.get('/images-:id', getStickers(connection));

router.get('/:id', getStickerPack(connection));

export default router;