import {Group} from '../index.model';
import {Express,Request,Response,NextFunction} from 'express';
import {checkjwt} from '../../config/config.passport';
import {IGroup} from './groups';
import {filter,LineError} from '../../services/services'

export function groupController(url:string,app:Express,io:SocketIO.Server):void{
    // registrar un grupo
    app.post(`${url}`,checkjwt,async(req:Request,res:Response)=>{
        const {name} = req.body;
        Group.create({
            name:name,
            folio:(await Group.countDocuments({}))+1
        })
        .then((data:IGroup)=>{
            res.status(200).json({
                status:true,
                message:"Grupo guardado correctamente"
            })
        })
        .catch(err=>{
            console.log(err);
            res.status(503).json({
                line:LineError(),
                file:"group.controller",
                message:"Error al guardar grupo"
            })
        })
    })

    // obtener todos los grupos registrados
    app.get(`${url}/:key?/:value?`,checkjwt,(req:Request,res:Response)=>{
        const [key,value] = [req.params.key,req.params.value]
        Group.find(filter(key,value))
        .then((data:Array<IGroup>)=>{
            res.status(200).json({
                status:true,
                data:data.length==1 && key!=undefined?data[0]:data
            })
        })
        .catch(err=>{
            console.log(err);
            res.status(503).json({
                line:LineError(),
                file:"group.controller",
                message:"Error al obtener grupo"
            })
        })
    })

    // editar grupos
    app.put(`${url}/:folio`,checkjwt,(req:Request,res:Response)=>{
        Group.updateOne({folio:parseInt(req.params.folio)},{
            name:req.body.name
        })
        .then((data)=>{
            res.status(200).json({
                status:true,
                message:"Grupo actualizado correctamente."
            })
        })
        .catch(err=>{
            console.log(err);
            res.status(503).json({
                line:LineError(),
                file:"group.controller",
                message:"Error al actualizar grupo"
            })
        })
    })

    app.delete(`${url}/:folio/:action`,checkjwt,(req:Request,res:Response)=>{
        const action:boolean = Boolean(req.params.action);
        Group.updateOne({folio:parseInt(req.params.folio)},{
            status:action
        })
        .then(data=>{
            let message = action==false?"eliminado ":"recuperado";
            res.status(200).json({
                status:true,
                message:"Grupo "+message+" correctamente"
            })
        })
        .catch(err=>{
            console.log(err);
            res.status(503).json({
                line:LineError(),
                file:"group controller",
                message:"Error al recuperar o eliminar grupo"
            })
        })
    })
}