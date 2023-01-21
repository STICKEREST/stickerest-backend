import express, { Express } from 'express';
import bodyParser from 'body-parser';
import expressFileUpload from 'express-fileupload';
import { initDb, getDb, Database } from './db';
import usersRoutes from './routes/users.routes';
import stickersRoutes from './routes/stickers.routes';
import auth from './routes/auth/auth.routes';
import passport from 'passport';
import { setupPassport } from './middlewares/passport.middleware';
import {sessionMiddleware, checkAuthentication} from './middlewares/session.middleware';
var fs = require('fs');


const dir = './public/files/temp';
const outputDir = './public/files/output/';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

if (!fs.existsSync(outputDir)){
  fs.mkdirSync(outputDir, { recursive: true });
}

require('dotenv').config();

const app: Express = express();

const port = process.env.PORT || 5000;

setupPassport();

const connection : Database = getDb();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use(expressFileUpload());

app.use('/users', usersRoutes);

app.use('/stickers', stickersRoutes);

app.use('/auth', checkAuthentication, auth);

app.get('/', (req, res) => res.send('Hello from Homepage') );


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
