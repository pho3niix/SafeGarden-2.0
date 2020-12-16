import {Document,model,Model,Schema} from 'mongoose';

export interface IUsers extends Document {
    type:number;
    email:string;
    password:string;
    pin?:number;
    active?:boolean;
    verified?:boolean;
    filename?:string;
    dateCreated?:Date;
    resetCode?:number;
    resetRequest?:boolean;
    name:string;
    lastname:string;
}

export const UserSchema = new Schema({
    type:{type:Number,required:true,min:1,max:2},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    pin:{type:Number,required:false},
    active:{type:Boolean,required:false,default:true},
    verified:{type:Boolean,required:false,default:false},
    filename:{type:String, required:false,default:null},
    dateCreated:{type:Date,required:false,default:Date.now()},
    resetCode:{type:Number,required:false,default:null},
    resetRequest:{type:Boolean,required:false,default:null},
    name:{type:String,required:false},
    lastname:{type:String,required:false}
})

export interface IUserModel extends Model<IUsers>{};
export const User = model<IUsers,IUserModel>("Users",UserSchema);

export function login(){
    console.log('login');
}