import {IUsers} from '../models/users';
import {User} from '../models/index';
import jwt from 'jsonwebtoken';
import config from '../config';
import {Express,Request,Response,NextFunction} from 'express';
import bcrypt from 'bcrypt';
const gpc = require('generate-pincode');
import {sendEmail} from '../global.functions';
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

export function userController(app:Express,io:SocketIO.Server){
    app.post('/user/register',async(req:Request,res:Response)=>{
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
                sendEmail(item.email,"Verificacion de cuenta","Su codigo de verificacion es: "+item.pin);
                res.status(200).json({
                    status:true,
                    message:'Usuario registrado con exito'
                })
            })
            .catch(err=>console.log(err));
        } catch (error) {
            console.log(error)
        }
    })

    app.post('/user/login',async(req:Request,res:Response,next:NextFunction)=>{
        passport.authenticate('local-login',{session:false},(err,user)=>{
            if(err||!user)res.status(503).json({status:false,message:"Credenciales invalidas."});
            if(user.verified){
                const expiresIn:number = 5184000;
                res.status(200).json({
                    token:createToken(user,expiresIn),
                    expires:expiresIn
                })
            }else{
                res.status(401).json({'message': "Favor de verificar la cuenta"});
            }
        })(req, res);
    })
}