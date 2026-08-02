import { AttachmentBuilder, CommandContext, createBooleanOption, createStringOption, Declare, MessageFlags, Options, SubCommand, User } from 'seyfert';
import { getGuild } from '../../../../store/guild.js';
import { name } from '@fallencodes/seyfert-utils';
import { createContainer, createSeparator, createTextDisplay, createTextSection } from '@fallencodes/seyfert-utils/components/message';
import Partner from '../../../../common/schemas/Partner.js';
import { capitalCase } from 'change-case';

const options = {
    'guild-id': createStringOption({
        min_length: 17,
        max_length: 19,
        description: ''
    }),
    raw: createBooleanOption({
        flag: true,
        description: ''
    })
};

@Declare({
    name: 'guild',
    aliases: ['g'],
    description: `View a guild's advanced info.`
})

@Options(options)

export default class extends SubCommand {
    run = async (context: CommandContext<typeof options>) => {
        const guildId = context.options['guild-id'] ?? context.guildId!;
        const guild = await context.client.guilds.fetch(guildId).catch(() => undefined);
        if (!guild) return context.editOrReply({ content: `guild doesn't have ${context.client.me.username} installed.` });
        const guildConfig = await getGuild(guild.id);

        if (context.options.raw === true) {
            const rawGuild = await context.client.guilds.raw(guild.id);

            const attachments = [new AttachmentBuilder({
                type: 'buffer',
                filename: `api-guild-info-${guild.id}.json`,
                resolvable: Buffer.from(JSON.stringify(rawGuild, null, 4))
            })];

            if (guildConfig) attachments.push(new AttachmentBuilder({
                type: 'buffer',
                filename: `es-guild-config-${guild.id}`,
                resolvable: Buffer.from(JSON.stringify(guildConfig, null, 4))
            }));

            return context.editOrReply({ files: attachments });
        };

        const partner = await Partner.findById(guild.id).lean();
        const guildOwner = await guild.fetchOwner();

        const configLines = [`### Config Info`];
        const partnerLines = [`### Partner Info`];

        const infoLines = [
            `### Guild Info`,
            `**ID**: \`${guild.id}\``,
            `**Name**: ${guild.name}`,
            `**Owner**: ${guildOwner ? name(guildOwner, 'username-id-s') : 'Unknown'}`
        ];

        if (guildConfig) {
            configLines.push(
                `**ID**: \`${guildConfig._id}\``,
                `**Premium Tier**: ${guildConfig.premiumTier}\n`,
                `**Flags**`
            );

            if (guildConfig.flags && guildConfig.flags.length > 0) configLines.push(
                `\`\`\`txt\n${guildConfig.flags.join(', ')}\n\`\`\``
            ); else configLines.push(`None`);
        } else configLines.push(
            `This guild isn't registered on ${context.client.me.username}.`
        );

        if (partner) {
            let representative: User | undefined;
            if (partner.representativeId) representative = await context.client.users.fetch(partner.representativeId);

            partnerLines.push(
                `**Status**: ${capitalCase(partner.status)}`,
                `**Invite Link**: ${partner.inviteCode ? `https://discord.gg/${partner.inviteCode}` : 'Unset'}`,
                `**Friendly Name**: ${partner.friendlyName ?? 'Unset'}`,
                `**Representative**: ${representative ? name(representative, 'username-id-s') : 'Unset'}`
            );

            if (partner.discovery.public === true) partnerLines.push(
                `\n### Discovery Info`,
                `**Tags**: ${partner.discovery.tags.map((tag) => capitalCase(tag)).join(', ') || 'None'}`,
                `**Status**: Public\n`,
                `>>> ${partner.discovery.description ?? 'No server description set.'}`
            )
        } else partnerLines.push(
            `This server hasn't setup their partner profile.`
        );

        const container = createContainer([
            createTextSection(infoLines.join('\n'), {
                url: guild.iconURL() ?? context.client.me.avatarURL(),
                type: 'thumbnail'
            }),
            createSeparator(),
            createTextDisplay(configLines.join('\n')),
            createSeparator(),
            createTextDisplay(partnerLines.join('\n'))
        ]);

        await context.editOrReply({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        });
    };
};
