import { Express, Request, Response, NextFunction } from 'express';
import { checkjwt } from '../../config/config.passport';
import { GetStatment, GetTotal } from './statement';
import { MyError } from '../../services/services';
import { GetStudent } from '../school_users/school.users';

export function statementControllers(url: string, app: Express, io: SocketIO.Server) {

    app.get(`${url}/:sStudentId`, async (req: Request, res: Response) => {

        const { sStudentId } = req.params;

        const student = await GetStudent(sStudentId);

        if (!student) return res.status(404).json(MyError(404, 'No se encontro alumno especificado'))

        const statement = await GetStatment(sStudentId);

        if (!statement) return res.status(404).json(MyError(404, 'No se encontro estado de cuenta especificado'))

        return res.status(200).json({
            status: true,
            res: statement
        });
    })

    app.get(`${url}/:sStudentId/total`, checkjwt, async (req: Request, res: Response) => {
        const { sStudentId } = req.params;

        const student = await GetStudent(sStudentId);

        if (!student) return res.status(404).json(MyError(404, 'No se encontro alumno especificado'));

        const total = await GetTotal(sStudentId);

        return res.status(200).json({
            status: true,
            res: total
        })
    })

}