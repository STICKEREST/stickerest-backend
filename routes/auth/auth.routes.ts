import express, { Router } from 'express';
import { Database, getDb } from '../../db';
import { getHome, getUser, logOut } from '../../controllers/users.controller';

const router: Router = express.Router();
const connection: Database = getDb();

// router.use('/create-sticker', (req,res) => {});

router.get('/:nickname', getUser(connection));

router.delete('/logout', logOut());

router.get('/home', getHome(connection));

export default router; 