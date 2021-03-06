import { Model, model, Schema, Document } from 'mongoose';

export interface IExpenses extends Document {
    description: string;
    amount: number;
    payDate: Date;
    status?: boolean;
    stringPayDate: string;
    frequency: string;
    times: number;
}

export const ExpensesSchema = new Schema({
    description: { type: String, required: false },
    amount: { type: Number, required: true },
    payDate: { type: Date, required: false },
    status: { type: Boolean, required: false },
    stringPayDate: { type: String, required: false },
    frequency: {type: String, required: false },
    times: {type: Number, required: false }
});

export interface IExpensesModel extends Model<IExpenses> { };
export const Expenses = model<IExpenses, IExpensesModel>('Expenses', ExpensesSchema);

export function ExpensesModel(body: IExpenses): any {
    return {
        description: body.description,
        amount: body.amount,
        payDate: new Date(body.payDate),
        status: false,
        stringPayDate: new Date(body.payDate).toLocaleDateString(),
        frequency: body.frequency,
        times: 1
    }
}