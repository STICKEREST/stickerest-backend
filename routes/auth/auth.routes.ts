import express, { Router } from 'express';
import { Database, getDb } from '../../db';
import { getHome, getUser, getUsers, logOut } from '../../controllers/users.controller';

const router: Router = express.Router();
const connection: Database = getDb();

router.delete('/logout', logOut());

router.get('/home', getHome(connection));

router.get('/:nickname', getUser(connection));

export default router; 