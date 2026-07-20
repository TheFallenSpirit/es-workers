import { Schema, model } from 'mongoose';

export interface GuildI {
    _id: number;
    guild: string;
    color?: number;
    premiumTier: number;
}

const guildSchema = new Schema<GuildI>({
    _id: { required: true, type: Number },
    guild: { required: true, type: String },
	premiumTier: { required: true, type: Number, default: 0 },
    color: { required: false, type: Number },
}, { _id: false, versionKey: false });

export default model('guilds', guildSchema);
