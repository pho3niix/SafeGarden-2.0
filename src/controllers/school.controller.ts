import {Student} from '../models/index';
import {GetStudents} from '../models/school.users';
import {Express,Request,Response,NextFunction} from 'express';
import {checkjwt} from '../config/config.passport';
import jwt from 'jsonwebtoken';
import config from '../config/config';

function studentController(base_url:string,app:Express,io:SocketIO.Server):void{
    app.get(`${base_url}`,checkjwt,async(req:Request,res:Response)=>{

        // const token = req.headers['authorization']; 

        // jwt.verify(token,config.secret,(err,success)=>{
        //     console.log(success);
        // })

        // console.log(jwt.decode(token));

        res.send('api de estudiantes')
    })
}

export {studentController};