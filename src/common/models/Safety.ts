import { Schema, model } from 'mongoose';

export interface InfractionI {
    reason: string;
    guildId?: string;
    issuedAt: Date;
    issuedBy: string;
    evidence: string[];
    authority: string;
}

interface SafetyProfileI {
    _id: string;
    flags?: Map<string, InfractionI>;
    restrictions?: Map<string, InfractionI>;
};

const infraction = new Schema<InfractionI>({
    reason: { required: true, type: String },
    guildId: { required: false, type: String },
    issuedAt: { required: true, type: Date },
    issuedBy: { required: true, type: String },
    authority: { required: true, type: String },
    evidence: { required: true, type: [String] }
}, { _id: false, versionKey: false });

const safetyProfileSchema = new Schema<SafetyProfileI>({
    _id: { required: true, type: String },
    flags: { required: false, type: Map, of: infraction },
    restrictions: { required: false, type: Map, of: infraction }
}, { _id: false, versionKey: false });

export default model('safetyProfiles', safetyProfileSchema);
