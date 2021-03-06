import {Document,Schema,Model,model} from 'mongoose';
import {ISchool} from '../school_users/school.users';
import * as services from '../../services/services';
import {School} from '../../api/school_users/school.users'

export interface IPayroll extends Document{
    folio:number;
    student:ISchool['folio'];
    date:Date,
    amount:number;
    concept:string;
    user:string;
};

export const PayRollSchema = new Schema({
    folio:{type:Number,required:true, unique:true},
    student:{type:Schema.Types.ObjectId,ref:'SchoolUsers',required:false},
    date:{type:Date,required:false,default:services.now()},
    stringDate:{type:String,required:false,default:services.StringNow()},
    amount:{type:Number,required:false},
    concept:{type:String,required:true},
    user:{type:String,required:true}
});

export interface IPayrollModel extends Model<IPayroll>{};
export const PayRoll = model<IPayroll,IPayrollModel>('PayRoll',PayRollSchema);

export function PayModel(body:IPayroll):any{
    return {
        student:body.student,
        amount:body.amount,
        concept:body.concept,
        user:body.user
    }
}