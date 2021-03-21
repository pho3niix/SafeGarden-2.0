import {Expenses} from '../index.model';
import {Express, Request, Response, NextFunction} from 'express';
import {checkjwt} from '../../config/config.passport';
import {IExpenses} from './expenses';
import {LineError} from '../../services/services';
import {ExpensesModel} from './expenses';

function suma(array:Array<any>):number{
    let total = 0;
    for (let i = 0; i < array.length; i++) {
        total = total + array[i];
    }
    return total;
}

export function expensesController(url:string, app:Express, io:SocketIO.Server):void{
    app.post(`${url}`, checkjwt,async(req:Request, res:Response, next:NextFunction)=>{
        const body:IExpenses = req.body;

        Expenses.create(ExpensesModel(body))
        .then((data)=>{
            res.status(200).json({
                status:true,
                res:"Gasto registrado correctamente"
            })
        })
        .catch(err=>{
            console.log(err);
            res.status(501).json({
                line:LineError(),
                file:'expenses.controller',
                message:'Error al guardar nuevo gasto'
            })
        })
    })

    app.get(`${url}`, checkjwt, async(req:Request, res:Response, next:NextFunction)=>{

        Expenses.aggregate([
            {
                $group:{
                    _id:"$status",
                    total:{"$sum":"$amount"},
                    items:{$sum:1},
                    expenses:{
                        $push:{
                            _id: "$_id",
                            description:"$description",
                            amount:"$amount",
                            status:"$status",
                            frequency:"$frequency",
                            payDate:"$stringPayDate",
                            times:"$times"
                        }
                    }
                }
            },
        ])
        .then(data=>{
            let status = [true,false];

            if(data.length<1){
                data = status.map(i=>{
                    return{
                        _id:i,
                        total:0,
                        items:0,
                        expenses: []
                    }
                })
            }

            if(data.length==1){
                data.push({
                    _id:!data[0]._id,
                    total:0,
                    items:0,
                    expenses:[]
                })
            }
            
            res.status(200).json({
                status:true,
                res:{
                    total: suma(data.filter(e=>e._id==false).map(i=>{
                        return i.total
                    })),
                    expenses:data
                }
            })
        })
        .catch(err=>{
            console.log(err);
            res.status(501).json({
                line:LineError(),
                file:'expenses.controller',
                message:'Error al mostrar tabla de gastos'
            })
        })

    })

    app.put(`${url}/:expenseId/:status`, checkjwt, async(req:Request, res:Response, next:NextFunction)=>{
        const { status, expenseId } = req.params;

        Expenses.updateOne({_id:expenseId},{status: (status == 'true')})
        .then(data=>{
            res.status(200).json({
                status:true,
                res:"Estatus de gasto actualizado con exito"
            })
        })
        .catch(err=>{
            console.log(err);
            res.status(501).json({
                line:LineError(),
                file:'expenses.controller',
                message:'Error al cambiar estado de gasto'
            })
        })

    })
}