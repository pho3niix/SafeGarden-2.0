import {Student} from '../models/index';
import {GetStudents} from '../models/students';
import {Express,Request,Response,NextFunction} from 'express';
import {checkjwt} from '../config.passport'

function studentController(app:Express,io:SocketIO.Server):void{
    app.get("/students",checkjwt,async(req:Request,res:Response)=>{
        res.send('api de estudiantes')
    })
}

export {studentController};