import { CronOnCompleteCallback } from 'cron';
import Partner, { PartnerI } from '../../common/schemas/Partner.js';
import { ChainableCommander } from 'ioredis';
import rest from '../../common/rest.js';
import { wait } from '../../common/index.js';
import { redis } from '../../store/index.js';
import dayjs from 'dayjs';
import { getGuild } from '../../store/guild.js';

export default async (done: CronOnCompleteCallback) => {
    let partners = await Partner.find({ status: 'active', 'discovery.public': true });
    if (partners.length < 1) return done();
    partners = shuffleArray(partners);

    for await (const partner of partners) {
        await addToDiscovery(partner);
        await wait(5000);
    };
};

export const addToDiscovery = async (partner: PartnerI) => {
    const pipeline = redis.pipeline();
    removeFromDiscovery(partner, pipeline);
    const key = `es_discovery:${partner._id}`;

    const preview = await rest.guilds(partner._id).preview.get().catch(() => {});
    if (!preview) return pipeline.exec();
    const guildConfig = await getGuild(partner._id);

    const data: DiscoveryCache = {
        id: partner._id,
        name: preview.name,
        icon: `https://cdn.discordapp.com/icons/${partner._id}/${preview.icon}.webp?quality=lossless`,
        tags: partner.discovery.tags,
        color: guildConfig?.color ?? 0xfaff6d,
        inviteCode: partner.inviteCode!,
        description: partner.discovery.description!,
        memberCount: preview.approximate_member_count,
        presenceCount: preview.approximate_presence_count,
        statsUpdatedAt: dayjs.utc().unix(),
        serverUpdatedAt: dayjs.utc(partner.updatedAt).unix()
    };

    pipeline.set(key, JSON.stringify(data));
    pipeline.sadd(`es_discovery_list`, key);
    for (const tag of partner.discovery.tags) pipeline.sadd(`es_discovery_list:${tag}`, key);
    await pipeline.exec();
};

async function removeFromDiscovery(partner: PartnerI, pipeline: ChainableCommander) {
    const key = `es_discovery:${partner._id}`;
    pipeline.del(key);
    pipeline.srem(`es_discovery_list`, key);
    for (const tag of partner.discovery.tags) pipeline.srem(`es_discovery_list:${tag}`, key);
};

function shuffleArray<T>(array: T[]): T[] {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j]!, result[i]!];
    };

    return result;
};

interface DiscoveryCache {
    id: string;
    name: string;
    icon: string;
    tags: string[];
    color: number;
    inviteCode: string;
    description: string;
    memberCount: number;
    presenceCount: number;
    statsUpdatedAt: number;
    serverUpdatedAt: number;
}
