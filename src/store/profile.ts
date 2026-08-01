import { UpdateQuery } from 'mongoose';
import Profile, { ProfileI } from '../common/schemas/Profile.js';
import { redis, reviver } from './index.js';

export async function getProfile(userId: string): Promise<ProfileI | undefined> {
    const redisProfile = await redis.get(`es_profile:${userId}`);
    if (redisProfile) return JSON.parse(redisProfile, reviver) as ProfileI;

    const dbProfile = await Profile.findOne({ user: userId });
    if (dbProfile) return dbProfile.toObject();
};

export async function updateProfile(userId: string, query: UpdateQuery<ProfileI>): Promise<ProfileI> {
    const profile = await Profile.findOneAndUpdate({ user: userId }, query, { returnDocument: 'after' });
    if (!profile) throw new Error('Profile not found during update');
    await redis.del(`es_profile:${userId}`);
    return profile.toObject();
};
