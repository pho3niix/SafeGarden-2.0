import {IUsers} from '../models/sesion.users';
import {User} from '../models/index';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import {Express,Request,Response,NextFunction} from 'express';
import bcrypt from 'bcrypt';
const gpc = require('generate-pincode');
import {sendEmail} from '../services';
import passport from 'passport';

function createToken(payload:IUsers,expires:number):string{
    let options={};
    if(expires>0)options={expiresIn:expires};
    return jwt.sign({
        id:payload._id,
        email:payload.email,
        name:payload.name
    },config.secret,options);
}

export function userController(base_url:string,app:Express,io:SocketIO.Server){
    app.post(`${base_url}/register`,async(req:Request,res:Response)=>{
        const obj = req.body;
        try {
            const user:IUsers = await User.findOne({email:obj.email});
            if(user)res.status(503).json({status:false,message:'El correo ya existe por favor intente con otro.'});
            const password = await bcrypt.hash(obj.password,bcrypt.genSaltSync(config.Bcrypt_rounds));
            User.create({
                type:obj.type,
                email:obj.email,
                password: password,
                name:obj.name,
                lastname:obj.lastname,
                pin:gpc(6)
            })
            .then((item:IUsers)=>{
                sendEmail(config.nodemailer.user,item.email,"Verificacion de cuenta","Su codigo de verificacion es: "+item.pin);
                res.status(200).json({
                    status:true,
                    message:'Usuario registrado con exito'
                })
            })
            .catch((err:Error)=>{
                console.log(err)
                res.status(503).json({
                    status:false,
                    message:"Error al crear usuario"
                })
            });
        } catch (error) {
            console.log(error);
            res.send(error);
        }
    })

    app.post(`${base_url}/login`,async(req:Request,res:Response,next:NextFunction)=>{
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