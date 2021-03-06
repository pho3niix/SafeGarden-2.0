import {Express} from 'express';
import {schoolController} from './school_users/school.controller';
import {userController} from './users_sesions/users.controller';
import {groupController} from './groups/groups.controller';
import {payrollControllers} from './payroll/payroll.controller';
import {statementControllers} from './statement/statement.controller';
import {expensesController} from './expenses/expenses.controller';

export function configRoutes(app:Express,io:SocketIO.Server):void{
    schoolController('/school',app,io);
    userController('/users',app,io);
    groupController('/groups',app,io);
    payrollControllers('/pay',app,io);
    statementControllers('/statement',app,io);
    expensesController('/expenses', app, io);
}