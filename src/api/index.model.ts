import { School } from './school_users/school.users';
import { User } from './users_sesions/sesion.users';
import { Statement } from './statement/statement';
import { Group } from './groups/groups';
import { PayRoll } from './payroll/payroll';
import { Record } from './record/record';
import { Expenses } from './expenses/expenses';
import mongoose from 'mongoose';

export function initDB(name: string): void {
    mongoose.connect(name, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(async (db) => {
            // if (process.env.NODE_ENV !== 'production') {
            //     mongoose.set("debug", true);
            // }
            console.log(">>> Database connected");
        })
        .catch((err: Error) => {
            console.log(err);
        })
};

export { School, User, Group, Statement, PayRoll, Record, Expenses };