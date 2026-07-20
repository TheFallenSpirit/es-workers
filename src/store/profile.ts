import Profile, { ProfileI } from '../common/schemas/Profile.js';
import { redis, reviver } from './index.js';

export async function getProfile(userId: string): Promise<ProfileI | undefined> {
    const redisProfile = await redis.get(`es_profile:${userId}`);
    if (redisProfile) return JSON.parse(redisProfile, reviver) as ProfileI;

    const dbProfile = await Profile.findOne({ user: userId });
    if (dbProfile) return dbProfile.toObject();
};
