import {PayRoll,Statement,School} from '../index.model';
import {Express,Request,Response,NextFunction} from 'express';
import {checkjwt} from '../../config/config.passport';
import {filter,LineError,StringNow,ltDate} from '../../services/services';
import {PayModel} from './payroll';
import {PostCharge} from '../statement/statement';
import {PostRecord} from '../record/record';

export function payrollControllers(url:string,app:Express,io:SocketIO.Server):void{
    
    app.post(`${url}`,checkjwt,async(req:Request,res:Response,next:NextFunction)=>{
        const body = req.body;
        const folio:number = (await PayRoll.countDocuments({})) + 1;
        
        const student = await School.findOne({_id:body.student});
        if(!student) return res.status(404).json({message:"Alumno no existe",status:false});

        PayRoll.create({...PayModel(body),...{folio:folio}})
        .then(async(data)=>{
            await PostCharge(data,1);
            return data;
        })
        .then(async(data)=>{
            await PostRecord(data.amount,data.concept,"entrada");
        })
        .then(()=>{
            res.status(200).json({
                status:true,
                res:"Ingreso registrado correctamente"
            })
        })
        .catch(err=>{
            console.log(err);
            res.status(503).json({
                line:LineError(),
                file:'payroll.controller',
                message:'Error al guardar ingreso.'
            })
        })
    })

    app.get(`${url}/:start/:end`,checkjwt,async (req:Request,res:Response)=>{
        const { start, end } = req.params;

        PayRoll.aggregate([
            {
                $match:{
                    date:{$gte:new Date(start),$lt:new Date(ltDate(end))}
                }
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
                    _id: "$__v",
                    total:{"$sum":"$amount"},
                    payments:{
                        $push:{
                            concept:"$concept",
                            amount:"$amount",
                            madeBy:"$user",
                            student:"$student.names"
                        }
                    }
                }
            }
        ])
        .then(data=>{
            res.status(200).json({
                status:true,
                res:{
                    range:{
                        from:start,
                        to:end
                    },
                    total: data.length>0?data[0].total:0,
                    payments:data.length>0?data[0].payments:[]
                }
            })
        })
        .catch((err:Error)=>{
            console.log(err);
            res.status(503).json({
                line:LineError(),
                file:"payroll.controller",
                message:"Error al calcular total de ingresos"
            })
        })
    })

    app.get(`${url}`,checkjwt,async(req:Request,res:Response)=>{
        PayRoll.aggregate([
            {
                $match:{stringDate:StringNow()}
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
                    _id: "$stringDate",
                    total:{"$sum":"$amount"},
                    payments:{
                        $push:{
                            concept:"$concept",
                            amount:"$amount",
                            madeBy:"$user",
                            student:"$student.names"
                        }
                    }
                }
            }
        ])
        .then(data=>{
            res.status(200).json({
                status:true,
                res:{
                    date:StringNow(),
                    total: data.length>0?data[0].total:0,
                    payments:data.length>0?data[0].payments:[]
                }
            })
        })
        .catch(err=>{
            console.log(err);
            res.status(503).json({
                line:LineError(),
                file:"payroll.controller",
                message:"Error al calcular total de ingresos"
            })
        })
    })
}