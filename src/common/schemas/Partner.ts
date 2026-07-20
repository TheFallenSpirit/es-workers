import { model, Schema } from 'mongoose';

type PartnerStatus = 'none' | 'active' | 'revoked' | 'applicationPending' | 'applicationDenied';

export interface PartnerI {
    _id: string;
    status: PartnerStatus;
    updatedAt: Date;
    inviteCode?: string;
    discovery: {
        tags: string[];
        public: boolean;
        description?: string;
    };
}

const partnerSchema = new Schema<PartnerI>({
    _id: { required: true, type: String },
    status: { required: true, type: String, default: 'none' },
    inviteCode: { required: false, type: String },
    discovery: {
        tags: { required: true, type: [String], default: [] },
        public: { required: true, type: Boolean, default: false },
        description: { required: false, type: String }
    }
}, { _id: false, versionKey: false });

export default model('partners', partnerSchema);
