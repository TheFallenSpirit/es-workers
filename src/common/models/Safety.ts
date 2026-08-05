import { Schema, model } from 'mongoose';

interface InfractionI {
    _id: string;
    reason: string;
    issuedAt: Date;
    issuedBy: string;
    authority: string;
    evidence: string[];
    guildId?: string;
}

interface SafetyProfileI {
    _id: string;
    warns: InfractionI[];
    flags: Map<string, InfractionI>;
    restrictions: Map<string, InfractionI>;
};

const infraction = new Schema<InfractionI>({
    _id: { required: true, type: String },
    reason: { required: true, type: String },
    guildId: { required: false, type: String },
    issuedAt: { required: true, type: Date },
    issuedBy: { required: true, type: String },
    authority: { required: true, type: String },
    evidence: { required: true, type: [String] }
}, { _id: false, versionKey: false });

const safetyProfileSchema = new Schema<SafetyProfileI>({
    _id: { required: true, type: String },
    warns: { required: true, type: [infraction], default: [] },
    flags: { required: true, type: Map, of: infraction, default: new Map() },
    restrictions: { required: true, type: Map, of: infraction, default: new Map() }
}, { _id: false, versionKey: false, timestamps: true });

export default model('safetyProfiles', safetyProfileSchema);
