import {Express} from 'express';
import {studentController} from './controllers/school.controller';
import {userController} from './controllers/users.controller';

function configRoutes(app:Express,io:SocketIO.Server):void{
    studentController('/students',app,io);
    userController('/users',app,io);
}

export {configRoutes};