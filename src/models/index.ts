import {Student} from './students';
import {User} from './users';
import mongoose from 'mongoose';

export function initDB(name:string):void{
    mongoose.connect(name,{
        useCreateIndex:true,
        useNewUrlParser:true,
        useUnifiedTopology:true
    })
    .then(async(db)=>{
        // if (process.env.NODE_ENV !== 'production') {
        //     mongoose.set("debug", true);
        // }
        console.log(">>> Database connected");
    })
    .catch((err:Error)=>{
        console.log(err);
    })
};

export {Student,User};