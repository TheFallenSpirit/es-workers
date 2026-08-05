// Partial ES Report Schema
// This schema only provides fields required for these workers to operate properly.

import { Schema, model } from "mongoose";

export interface ReportI {
    _id: number;
    // user?: string;
    guild?: string;
    status: string;
    // reason: string;
    channel: string;
    createdAt: Date;
    submitter: string;
    // evidence: string[];
    // transcript: string[];
}

const reportSchema = new Schema<ReportI>({
    _id: { required: true, type: Number },
    status: { required: true, type: String },
    // user: { required: false, type: String },
    guild: { required: false, type: String },
    channel: { required: true, type: String },
    submitter: { required: true, type: String },
    // reason: { required: true, type: String },
    // evidence: { required: true, type: [String] },
    // transcript: { required: true, type: [String], default: [] }
}, { _id: false, versionKey: false });

export default model('reports', reportSchema);
