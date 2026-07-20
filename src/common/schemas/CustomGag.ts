// Partial ES CustomGag Schema
// This schema only provides fields required for these workers to operate properly.

import { Schema, model } from 'mongoose';

export interface GagI {
    _id: string;
    name: string;
    userId?: string;
    guildId?: string;
}

const gagSchema = new Schema<GagI>({
    _id: { required: true, type: String },
	name: { required: true, type: String },
    userId: { required: false, type: String },
    guildId: { required: false, type: String }
}, { _id: false, versionKey: false });

export default model('customGags', gagSchema);
