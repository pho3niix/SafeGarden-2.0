import {School} from '../index.model';
import {GetSchool,ITutors,IAddress, ISchool,SchoolModel} from './school.users';
import {Express,Request,Response,NextFunction} from 'express';
import {checkjwt} from '../../config/config.passport';
import {filter,LineError} from '../../services/services';
import {iniStatement} from '../statement/statement';

export function schoolController(url:string,app:Express,io:SocketIO.Server):void{
    //registrar maestro o alumno
    app.post(`${url}`,checkjwt,async(req:Request,res:Response)=>{
        const body = req.body;
        let school_user = new School(SchoolModel(body));
        school_user.folio = (await School.countDocuments({}))+1,
        school_user.save()
        .then((data:ISchool)=>{
            iniStatement(data);
            return data;
        })
        .then((data:ISchool)=>{
            res.status(200).json({
                status:true,
                res:"School User guardado correctamente"
            })
        })
        .catch((err:Error)=>{
            console.log(err);
            res.status(500).json({
                line:LineError(),
                file:"school.controller",
                message:"Error al guardar School user."
            })
        })
    });

    // obtener school users, recibe un parametro de tipo para identificar si es alumno o maestro
    app.get(`${url}/:key?/:value?`,checkjwt,(req:Request,res:Response,next:NextFunction)=>{
        const [key,value] = [req.params.key,req.params.value];
        GetSchool({...filter(key,value),...{status:true}})
        .then((data:Array<ISchool>)=>{
            res.status(200).json({
                status:true,
                res:data.length==1 && key!=undefined?SchoolModel(data[0]):data.map(item=>SchoolModel(item))
            });
        })
        .catch((err:Error)=>{
            console.log(err);
            res.status(500).json({
                line:LineError(),
                file:"school.controller",
                message:"Error al obtener alumnos."
            })
        })
    });

    // Editar school users por folio
    app.put(`${url}/:folio`,checkjwt,(req:Request,res:Response)=>{
        School.updateOne({folio:parseInt(req.params.folio)},SchoolModel(req.body))
        .then((data)=>{
            res.status(200).json({
                status:true,
                res:"School user actualizado con exito"
            });
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({
                line:LineError(),
                file:"school.controller",
                message:"Error al actualizar school user."
            })
        })
    })

    // Borrado logico de un alumno o maestro (cambia el status de true a false)
    app.delete(`${url}/:folio/:action`,checkjwt,(req:Request,res:Response)=>{
        const action:boolean = Boolean(req.params.action);
        School.updateOne({folio:parseInt(req.params.folio)},{status:action})
        .then((data)=>{
            let message = action==false?"eliminado ":"recuperado";
            res.status(200).json({
                status:true,
                res:"School user "+message+" correctamente"
            })
        })
        .catch(err=>{
            console.log(err);
            res.status(503).json({
                line:LineError(),
                file:"school.controller",
                message:"Error al eliminar school user"
            })
        })
    });
}