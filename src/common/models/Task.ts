// Partial ES Task Schema
// This schema only provides fields required for these workers to operate properly.

import { model, Schema } from 'mongoose';

export interface TaskI {
    _id: number;
    fId: number;
    due?: Date;
    user: string;
    name: string;
    repeat?: number;
    archived: boolean;
    createdAt: Date;
    dueWarned?: boolean;
    assignedBy?: string;
    completedAt?: Date;
}

const taskSchema = new Schema<TaskI>({
    _id: { required: true, type: Number },
    fId: { required: true, type: Number },
    user: { required: true, type: String },
    name: { required: true, type: String },
    due: { required: false, type: Date },
    repeat: { required: false, type: Number },
    archived: { required: true, type: Boolean, default: false },
    dueWarned: { required: false, type: Boolean },
    assignedBy: { required: false, type: String },
    completedAt: { required: false, type: Date }
}, { _id: false, versionKey: false });

export default model('tasks', taskSchema);
