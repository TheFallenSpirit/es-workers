import { Schema } from 'mongoose';

export type BedtimeDay = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface BedtimeScheduleI {
    days: BedtimeDay[];
    start: number;
    duration: number;
}

const scheduleSchema = new Schema<BedtimeScheduleI>({
    days: { required: true, type: [Number] },
    start: { required: true, type: Number },
    duration: { required: true, type: Number }
}, { _id: false, versionKey: false });

export interface ProfileBedtimeI {
    gagType?: string;
    schedule?: BedtimeScheduleI[];
    allowVoice?: boolean;
    allowMentions?: boolean;
    impairmentType?: 'gag' | 'mute' | 'timeout' | 'none';
}

export const profileBedtimeSchema = new Schema<ProfileBedtimeI>({
    gagType: { required: false, type: String },
    allowVoice: { required: false, type: Boolean },
    allowMentions: { required: false, type: Boolean },
    impairmentType: { required: false, type: String },
    schedule: { required: false, type: [scheduleSchema] }
}, { _id: false, versionKey: false });
