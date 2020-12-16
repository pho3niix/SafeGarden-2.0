import express,{Request,Response,Express, NextFunction} from 'express';
import morgan from 'morgan';
import cors from 'cors';
import config from './config';
import dotenv from 'dotenv';
import fileupload from 'express-fileupload';
import path from 'path';
import {configRoutes} from './routes/index';
import {initDB} from './models/index';
import http from 'http';
import socketIO from 'socket.io';
import {initPassport} from './config.passport';
import passport, { PassportStatic } from 'passport';

export class Application {
    
    private app:Express;
    private port:number|string;
    private db_name:string;
    private io:socketIO.Server;
    private httpServer:http.Server;
    private passport:PassportStatic;
    public appName:string;

    constructor(){
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.httpServer = http.createServer(this.app);
        this.io = socketIO(this.httpServer);
        this.db_name = config.MONGODB_URI;
        this.appName = config.appName;
        this.passport = passport;
        this.init();
    }

    private init():void{
        this.initSockets();
        this.middlewares();
        this.database();
        this.routes(this.io);
    }

    private database():void{
        initDB(this.db_name);
    }

    private initSockets():void{
        this.io.on('connection',(client)=>{
            console.log("Usuario conectado");
            client.on("disconnect",()=>{
                console.log("Usuario desconectado");
            })
        })
    }

    private middlewares():void{
        if(process.env.NODE_ENV!=='production')dotenv.config();
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended:true}));
        this.app.use(morgan('dev'));
        this.app.use(cors());
        this.app.use(fileupload());
        this.app.use(this.passport.initialize());
        this.app.use(this.passport.session());
        initPassport(this.passport);
        const files_url:string = path.join(__dirname,'../public');
        this.app.use('/public',express.static(files_url,{index:true,extensions:['jpg','png','jpeg','gif']}));
    }

    private routes(io:SocketIO.Server):void{
        this.app.get('/',(req:Request,res:Response)=>{
            res.send(`This is ${this.appName} Api :)`);
        })
        configRoutes(this.app,io);

        // handle errors, route not found
        this.app.use((err:any, req:any, res:any, next:any)=>{
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};
            // render the error page
            res.status(err.status || 500);
            res.render('error');
        });
    }

    public start():void{
        this.httpServer.listen(this.port,()=>{
            console.log("App running on port",this.port);
        })
    }
}

const app = new Application();
app.start();