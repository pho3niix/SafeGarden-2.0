import {Schema,model,Model,Document} from 'mongoose';
import {IGroup} from '../groups/groups';
import * as services from '../../services/services';

export interface ISchool extends Document {
    names:string;
    lastName:string;
    address:IAddress;
    birthday:Date;
    home?:string;
    status?:boolean;
    folio:number;
    tutors?:Array<ITutors>;
    type:number;
    group?:IGroup['_id'];
    dateIn?:string;
    filename?:string;
    schedule?:ISchedule;
};

export interface ITutors{
    name:string;
    lastName:string;
    phone:{work:string,home:string};
    file:string;
    parent:string;
}

export interface IAddress{
    street:string;
    neighborhood:string;
    city:string;
    state:string;
    number:string;
}

interface ISchedule{
    in:string;
    out:string;
}

const StudentSchema:Schema = new Schema({
    type:{type:Number,required:false,unique:false},//1 alumno, 2 maestro
    names:{type:String, required:true, unique:false},
    lastName:{type:String, required:true, unique:false},
    address:{type:Object,required:false,unique:false},
    birthday:{type:Date,required:false,unique:false},
    home:{type:String,required:false,unique:false},//se refiere a la persona con la que vive el alumno
    status:{type:Boolean,required:true,unique:false,default:true}, //activo o inactivo en el sistema, NOTA si un alumno no podra ser dado de baja hasta que liquide sus adeudos en caso de existir alguno, de lo contrario se seguira generando
    folio:{type:Number, required:true, unique:true},
    tutors:[{type:Object, required:false, unique:false}],
    dateIn:{type:Date,required:false,default:services.now()},
    stringDate:{type:String,required:false,default:services.StringNow()},
    group:{type:Schema.Types.ObjectId,required:false,ref:"Group"},
    filename:{type:String,required:false,default:null},
    schedule:{type:Object,required:false}
})

export interface ISchoolModel extends Model<ISchool>{};
export const School = model<ISchool,ISchoolModel>("SchoolUsers",StudentSchema);

export function GetSchool(filter:{}):Promise<Array<ISchool>>{
    return new Promise(async(done,fail)=>{
        try {
            done(await School.find(filter))
        } catch (error) {
            fail(error);
        }
    })
}

export async function GetStudent(sStudentId:string):Promise<ISchool>{
    return await School.findOne({_id:sStudentId});
}

export function SchoolModel(body:ISchool):ISchool{
    let model:any = {
        _id:body._id,
        names:body.names,
        lastName:body.lastName,
        address:{
            street:body.address.street,
            neighborhood:body.address.neighborhood,
            city:body.address.city,
            state:body.address.state,
            number:body.address.number
        },
        birthday:body.birthday,
        type:body.type,
        folio:body.folio
    }
    if(body.type==1){
        model.home = body.home;
        model.tutors = body.tutors;
        model.group = body.group;
        model.schedule = body.schedule;
    }
    return model;
}