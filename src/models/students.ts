import {Schema,model,Model,Document} from 'mongoose';

export interface IStudent extends Document {
    name:string;
    lastName:string;
    mlastName:string;
    address:IAddress;
    phone:string;
    birthday:Date;
    home:string;
    status:boolean;
    folio:number;
    tutors:Array<ITutors>;
};

interface ITutors extends Document{
    name:string;
    lastName:string;
    mlastName:string;
    phone:{work:string,home:string};
    parent:string;
}

interface IAddress extends Document{
    street:string;
    neighborhood:string;
    city:string;
    state:string;
    number:string;
}

const StudentSchema:Schema = new Schema({
    name:{type:String, required:true, unique:false},
    lastName:{type:String, required:true, unique:false},
    mlastName:{type:String, required:true, unique:false},
    address:{type:Object,required:false,unique:false},
    phone:{type:String,required:false,unique:false},
    birthday:{type:Date,required:false,unique:false},
    home:{type:String,required:false,unique:false},//se refiere a la persona con la que vive
    status:{type:Boolean,required:true,unique:false,default:true},
    folio:{type:Number, required:true, unique:true},
    tutors:[{type:Object, required:true, unique:false}],
    skill:{type:String,required:false},
    groups:[{}],
    dateIn:{type:Date,required:false,default:Date.now()}
})

export interface IStudentModel extends Model<IStudent>{};
export const Student = model<IStudent,IStudentModel>("Student",StudentSchema);

export function GetStudents(filter:{}):Promise<Array<IStudent>>{
    return new Promise(async(done,fail)=>{
        try {
            done(await Student.find(filter))
        } catch (error) {
            fail(error);
        }
    })
}