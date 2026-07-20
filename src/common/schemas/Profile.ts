// Partial ES Profile Schema
// This schema only provides fields required for these workers to operate properly.

import { model, Schema } from 'mongoose';
import { ProfileBedtimeI, profileBedtimeSchema } from './profile/Bedtime.js';

export interface ProfileI {
    _id: number;
    user: string;
    bedtime?: ProfileBedtimeI;
    disabledNotifications?: string[];
}

const profileSchema = new Schema<ProfileI>({
    _id: { required: true, type: Number },
    user: { required: true, type: String },
    bedtime: { required: false, type: profileBedtimeSchema },
    disabledNotifications: { required: false, type: [String] }
}, { _id: false, versionKey: false });

export default model('profiles', profileSchema);
