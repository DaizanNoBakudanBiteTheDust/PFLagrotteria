//dependencias
import express from 'express';  
import cors from 'cors';
import handlebars from 'express-handlebars';
import mongoose from 'mongoose';
import {
        Server
} from 'socket.io';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import fileStore from 'session-file-store';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import compression from 'express-compression';
import winston from 'winston';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

//dependencias de ruta
import {
        __dirname,
        __maindirname
}
from './utils.js';
import configs from "./config.js";
import { initializePassport } from './config/passport.config.js';
import productRouter from './routes/api/products.router.js';
import cartRouter from './routes/api/cart.router.js';
import chatRouter from './routes/api/message.router.js';
import sessionRouter from './routes/api/users.router.js';
import viewsRouter from './routes/web/views.router.js';
import { addLogger, logger } from './utils/logger.js';

//Managers para el socket

import Products from './dao/dbManagers/products.dao.js';
import Carts from './dao/dbManagers/cart.dao.js';
import Messages from './dao/dbManagers/message.dao.js';




// const manager = new ProductManager(productsFilePath);
  const prodManager = new Products();
  const cartManager = new Carts();
  const chatManager = new Messages();



const fileStr = fileStore(session);

// Crea server express
const app = express();

app.use(addLogger);

// Conexion DB
try {
        // string de Conexion
        await mongoose.connect(configs.mongoUrl);
} catch (error) {
        console.error("conexion fallida")
}
console.log(__maindirname)

const swaggerOptions = {
        definition: {
            openapi: '3.0.1',
            info: {
                title: 'Documentación del Carrito de compras',
                description: 'API pensada para resolver las interacciones de un carrito de compra'
            }
        },
        apis: [`${__maindirname}/docs/**/*.yaml`]
    }
    
    const specs = swaggerJsdoc(swaggerOptions);
    
    app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs))


// configuracion passport
initializePassport();
app.use(passport.initialize())

//Servidor archivos estaticos

app.use(express.static(`${__dirname}/public`));

//middleware
app.use(express.json({}));
app.use(express.urlencoded({
        extended: true
}));
app.use(cookieParser());
app.use(cors());

app.use(compression({
        brotli: { enabled: true, zlib: {} }
    }));

// handlebars

app.engine('handlebars', handlebars.engine());
app.set('views', `${__dirname}/views`)
app.set('view engine', 'handlebars');

app.use(session({
        store: MongoStore.create({
               client:mongoose.connection.getClient(),
               ttl: 3600    
        }),
        name: 'cookieSession',
        secret: configs.secretCookie,
        resave: true,
        saveUninitialized: true
}));

// Ruta view
app.use('/', viewsRouter);

// Llama a la ruta de product Router (Todo lo hecho hasta ahora)
app.use('/api/products', productRouter);

// Ruta carts
app.use('/api/carts', cartRouter);

// Ruta chat
app.use('/api/chat', chatRouter);

// Ruta Session
app.use('/api/sessions', sessionRouter);

app.get('/loggerTest', (req, res) =>{
     //custom levels
    req.logger.error('error');
    req.logger.warn('warning');
    req.logger.info('info');
    req.logger.http('HTTP');
    req.logger.debug('debug');

    res.send({ result: 'ver errores' });
})


const server = app.listen(configs.port, () => logger.http('listening en 8080'));

// IO

const io = new Server(server)

app.set('socketio', io);

const chatText = [];


io.on('connection', socket => {

        //agrego producto via form
        socket.on('agregarProducto', async data => {
                await prodManager.save(data);
                io.emit('showProducts', await prodManager.getAll(req));
        });

         //elimino via form que me pasa el cliente
         socket.on('eliminarProducto', async (data) => {

                const _id = data
                await prodManager.delete(_id);
                io.emit('showProducts', await prodManager.getAll(req));

        });

        socket.on('message', async data => {
                await chatManager.save(data);
                io.emit('showChats', await chatManager.getAll());
        });    


});