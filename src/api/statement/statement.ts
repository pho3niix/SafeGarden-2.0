import {Document,model,Model,Schema,Types} from 'mongoose';
import {ISchool,School} from '../school_users/school.users';
import * as services from '../../services/services';
import {IPayroll} from '../payroll/payroll';

export interface IStatement extends Document {
    concept:string;
    student:ISchool['_id'],
    date?:Date,
    charge?:number;//cargo asignado
    credit?:number;//pago realizado
    balance:number;//saldo actual
}

const StatementSchema = new Schema({
    concept:{type:String,required:true},
    student:{type:Schema.Types.ObjectId,required:true,ref:'SchoolUsers'},
    date:{type:Date,required:false,default:services.now()},
    stringDate:{type:String,required:false,default:services.StringNow()},
    charge:{type:Number,required:false,default:0},
    credit:{type:Number,required:false,default:0},
    balance:{type:Number,required:false}
});

export interface IStatementModel extends Model<IStatement>{};
export const Statement = model<IStatement,IStatementModel>("Statement",StatementSchema);

export async function PostCharge(data:IPayroll,type:number):Promise<void | Error>{
    try {
        const balance = (await Statement.findOne({student:data.student}).sort({$natural:-1})).balance;
        await Statement.create({
            concept:data.concept,
            student:data.student,
            charge:type==2?data.amount:0,
            credit:type==1?data.amount:0,
            balance:balance-data.amount
        })
        console.log("Estado de cuenta creado");
    } catch (error) {
        console.log(["Error al crear estado de cuenta",error]);
    }
}

export function iniStatement(data:ISchool):void{
    Statement.create({
        concept:"Bienvenido al sistema",
        student:data._id,
        charge:0,
        credit:0,
        balance:0
    })
    .then((data:IStatement)=>{
        console.log({
            status:true,
            message:"Alumno inscrito al sistema"
        });
    })
    .catch((err:Error)=>{
        console.log({
            line:46,
            file:"statement.controller",
            message:"Error al generar inscripcion en el sistema"
        });
    })
}

export async function GetStatment(student:string):Promise<any>{
    const data = await Statement.aggregate([
        {
            $match:{student:Types.ObjectId(student)}
        },
        {
            $lookup:{
                from:"schoolusers",
                localField:"student",
                foreignField:"_id",
                as:"student"
            }
        },
        {
            $unwind:{
                path:"$student",
                preserveNullAndEmptyArrays:true
            }
        },
        {
            $group:{
                _id:"$student.names",
                statement:{
                    $push:{
                        concept:"$concept",
                        date:"$date",
                        charge:"$charge",
                        credit:"$credit",
                        balance:"$balance"
                    }
                }
            }
        }
    ])
    return data[0];
}

export async function GetTotal(student:string):Promise<any>{
    const data = await Statement.aggregate([
        {
            $match: { student: Types.ObjectId(student) }
        },
        {
            $lookup: {
                from: "schoolusers",
                localField: "student",
                foreignField: "_id",
                as: "student"

            }
        },
        {
            $unwind: {
                path: "$student",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $sort: { _id: -1 }
        },
        {
            $project: {
                _id: 0,
                student: "$student.folio",
                names: "$student.names",
                lastname: "$student.lastName",
                balance: "$balance"
            }
        }
    ])

    return data[0]
}