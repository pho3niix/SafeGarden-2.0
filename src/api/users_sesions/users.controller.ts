import {IUsers} from './sesion.users';
import {User} from '../index.model';
import {Express,Request,Response,NextFunction} from 'express';
import bcrypt from 'bcrypt';
const gpc = require('generate-pincode');
import passport from 'passport';
import {LineError, createToken, sendEmail} from '../../services/services';

export function userController(url:string,app:Express,io:SocketIO.Server):void{
    app.post(`${url}/register`,async(req:Request,res:Response)=>{
        const obj = req.body;
        const user:IUsers = await User.findOne({email:obj.email});
        if(user)res.status(503).json({status:false,message:'El correo ya existe por favor intente con otro.'});
        const password = await bcrypt.hash(obj.password,bcrypt.genSaltSync(parseInt(process.env.Bcrypt_rounds)));
        User.create({
            type:obj.type,
            email:obj.email,
            password: password,
            name:obj.name,
            lastname:obj.lastname,
            pin:gpc(6)
        })
        .then((item:IUsers)=>{
            sendEmail(process.env.mail_user,item.email,"Verificacion de cuenta","Su codigo de verificacion es: "+item.pin);
            res.status(200).json({
                status:true,
                message:'Usuario registrado con exito'
            })
        })
        .catch((err:Error)=>{
            console.log(err)
            res.status(503).json({
                line:LineError(),
                file:"users.controller",
                message:"Error al guardar usuario nuevo"
            })
        });
    })

    app.post(`${url}/login`,async(req:Request,res:Response,next:NextFunction)=>{
        passport.authenticate('local-login',{session:false},(err:Error,user:IUsers)=>{
            if(err||!user)res.status(503).json({status:false,message:"Credenciales invalidas."});
            if(!user.verified)res.status(401).json({status:false,message: "Favor de verificar la cuenta"});
            
            const expiresIn:number = 5184000;
            res.status(200).json({
                token:createToken(user,expiresIn),
                expires:expiresIn
            })
        })(req, res);
    })
}