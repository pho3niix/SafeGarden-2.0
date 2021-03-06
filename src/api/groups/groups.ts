import { Document, model, Model, Schema } from 'mongoose';

export interface IGroup extends Document {
    name: string;
    folio: number;
    status?: boolean;
}

const GroupSchema = new Schema({
    name: { type: String, required: false },
    folio: { type: Number, required: false },
    status: { type: Boolean, required: false, default: true }
});

export interface IGroupModel extends Model<IGroup> { };
export const Group = model<IGroup, IGroupModel>("Group", GroupSchema);