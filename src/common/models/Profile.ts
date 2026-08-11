// Partial ES Profile Schema
// This schema only provides fields required for these workers to operate properly.

import { model, Schema } from 'mongoose';
import { ProfileBedtimeI, profileBedtimeSchema } from './profile/Bedtime.js';

export interface ProfileI {
    _id: number;
    user: string;
    flags?: string[];
    bedtime?: ProfileBedtimeI;
    premiumTier?: number;
    limitModifiers?: LimitsModifiersI;
    permissionLevel?: number;
    disabledNotifications?: string[];
}

interface LimitsModifiersI {
	subs?: number;
	rules?: number;
	owners?: number;
	shockers?: number;
	authUsers?: number;
	customGags?: number;
	customGagRules?: number;
}

const limitModifiersSchema = new Schema<LimitsModifiersI>({
	subs: { required: false, type: Number },
	rules: { required: false, type: Number },
	owners: { required: false, type: Number },
	shockers: { required: false, type: Number },
	authUsers: { required: false, type: Number },
	customGags: { required: false, type: Number },
	customGagRules: { required: false, type: Number }
}, { _id: false, versionKey: false });

const profileSchema = new Schema<ProfileI>({
    _id: { required: true, type: Number },
    user: { required: true, type: String },
    flags: { required: false, type: [String] },
    bedtime: { required: false, type: profileBedtimeSchema },
    premiumTier: { required: false, type: Number },
    limitModifiers: { required: false, type: limitModifiersSchema },
    permissionLevel: { required: false, type: Number },
    disabledNotifications: { required: false, type: [String] },
}, { _id: false, versionKey: false });

export default model('profiles', profileSchema);
