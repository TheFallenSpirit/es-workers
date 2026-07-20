import Guild, { GuildI } from '../common/schemas/Guild.js';
import { redis, reviver } from './index.js';

export async function getGuild(guildId: string): Promise<GuildI | undefined> {
    const cachedGuild = await redis.get(`es_guild:${guildId}`);
    if (cachedGuild) return JSON.parse(cachedGuild, reviver);

    const dbGuild = await Guild.findOne({ guild: guildId });
    return dbGuild?.toObject();
};
