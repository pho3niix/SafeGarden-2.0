import {Model,model,Schema,Document} from 'mongoose';
import {now} from '../../services/services';
import { IPayroll } from '../payroll/payroll';

export interface IRecord extends Document{
    date?:Date;
    type:string;
    description:string;
    amount:number;
}

const RecordSchema:Schema = new Schema({
    date:{type:Date,required:false,unique:false,default:now()},
    type:{type:String,required:false,unique:false},
    description:{type:String,required:false,unique:false},
    amount:{type:Number,required:false,unique:false}
});

export interface IRecordModel extends Model<IRecord>{};
export const Record = model<IRecord,IRecordModel>("Record",RecordSchema);

export async function PostRecord(amount:number,description:string,type:string):Promise<string>{
    await Record.create({
        type:type,
        description:description,
        amount:amount
    })

    return "Movimiento guardado en historial";
}