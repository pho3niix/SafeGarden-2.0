import {Express} from 'express';
import {studentController} from '../controllers/students.controller';
import {userController} from '../controllers/users.controller';

function configRoutes(app:Express,io:SocketIO.Server):void{
    studentController(app,io);
    userController(app,io);
}

export {configRoutes};