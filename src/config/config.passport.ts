import passportJwt from 'passport-jwt';
import passport,{PassportStatic} from 'passport';
import bcrypt from 'bcrypt';
import {User} from '../Api/index.model';
import {Request,Response,NextFunction} from 'express';
import passportLocal from 'passport-local';
import { IUsers } from '../Api/users_sesions/sesion.users';

const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;

//iniciar sesion de manera local
function authLocal(req:Request,email:string,password:string,done:Function):void{
    User.findOne({email:email,active:true,type:req.body.type})
    .then(async(user:IUsers)=>{
        if(!user)done(null,false,{status:401,message:'Credenciales invalidas.'});
        if(await bcrypt.compare(password,user.password)){
            done(null,user);
        }else{
            done(null,false,{status:401,message:'Credenciales invalidas.'});
        }
    })
    .catch((err:Error)=>{
        done(err);
    })
}

function authJwt(payload:any,done:Function):void{
    User.findOne({_id:payload.id,active:true,verified:true})
    .then((user:IUsers)=>{
        if(!user)done(null,false,{status:404,message:'El usuario no existe'});
        done(null,user);
    })
    .catch((err:Error)=>{
        done(err,false,{status:500,message:'Error en la db.'})
    })
}

//inicializar passport
export function initPassport(passport:PassportStatic):void{
    //JWT strategy for access to route
    passport.use('jwt',new JwtStrategy({
        jwtFromRequest: passportJwt.ExtractJwt.fromHeader('authorization'),
        secretOrKey:process.env.SECRET_KEY
    },authJwt));
    //Local strategy for login to app
    passport.use('local-login',new LocalStrategy({
        usernameField:'email',
        passReqToCallback:true
    },authLocal));
}

export function checkjwt(req:Request,res:Response,next:NextFunction):void{
    console.log({
        body:req.body,
        params:req.params,
        query:req.query
    });
    passport.authenticate('jwt',{session:false},(err,user,info)=>{
        if(err)next(err);
        if(!user)res.status(401).json({status:401,message:'No autorizado.'});
        next();
    })(req,res,next);
}