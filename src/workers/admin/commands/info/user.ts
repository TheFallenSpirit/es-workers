import { AttachmentBuilder, CommandContext, createBooleanOption, createUserOption, Declare, GuildMember, MessageFlags, Options, SubCommand } from 'seyfert';
import { getProfile } from '../../../../store/profile.js';
import { createContainer, createSeparator, createTextDisplay, createTextSection } from '@fallencodes/seyfert-utils/components/message';
import Safety from '../../../../common/schemas/Safety.js';
import dayjs from 'dayjs';

const options = {
    user: createUserOption({
        description: 'The user you want to view info of.'
    }),
    raw: createBooleanOption({
        flag: true,
        description: 'If raw JSON files of associated data should be returned.'
    })
};

@Declare({
    name: 'user',
    aliases: ['u'],
    description: `View a user's advanced info.`
})

@Options(options)

export default class extends SubCommand {
    run = async (context: CommandContext<typeof options>) => {
        let user = context.options.user ?? context.author;
        if (user instanceof GuildMember) user = user.user;
        const profile = await getProfile(user.id);

        if (context.options.raw === true) {
            const rawUser = await context.client.users.raw(user.id);
            const attachments: AttachmentBuilder[] = [];

            attachments.push(new AttachmentBuilder({
                type: 'buffer',
                filename: `api-user-info-${user.id}.json`,
                resolvable: Buffer.from(JSON.stringify(rawUser, null, 4))
            }));

            if (profile) attachments.push(new AttachmentBuilder({
                type: 'buffer',
                filename: `es-profile-${user.id}.json`,
                resolvable: Buffer.from(JSON.stringify(profile, null, 4))
            }));

            return context.editOrReply({ files: attachments });
        };

        const infoLines = [
            `### User Info - ${user}`,
            `**ID**: \`${user.id}\``,
            `**Username**: \`${user.username}\``
        ];
        
        const profilesLines = [
            `### Profile Info\n`
        ];

        if (profile) {
            profilesLines.push(
                `**ID**: \`${profile._id}\``,
                `**Premium Tier**: ${profile.premiumTier ?? 'None'}`,
                `**Permission Level**: ${profile.permissionLevel ?? 'None'}\n`,
                `**Flags**`
            );

            if (profile.flags && profile.flags.length > 0) profilesLines.push(
                `\`\`\`txt\n${profile.flags.join(', ')}\n\`\`\``
            ); else profilesLines.push('None\n');

            profilesLines.push(`**Disabled Notifications**`);
            if (profile.disabledNotifications && profile.disabledNotifications.length > 0) profilesLines.push(
                `\`\`\`txt\n${profile.disabledNotifications?.join(', ')}\n\`\`\``,
            ); else profilesLines.push('None');
        } else profilesLines.push(
            `This user isn't registered on ${context.client.me.username}.`
        );

        const safetyLines = [`### Safety Flags & Restrictions`];
        const safetyProfile = await Safety.findById(user.id);

        if (safetyProfile) {
            const infractions = [
                ...safetyProfile.flags.values().map((infraction) => ({ type: 'flag', ...infraction })),
                ...safetyProfile.restrictions.values().map((infraction) => ({ type: 'blacklist', ...infraction }))
            ];

            for await (const impairment of infractions) {
                const issuer = await context.client.users.fetch(
                    impairment.issuedBy
                ).catch(() => undefined);

                safetyLines.push(
                    `\n- ${impairment._id} ${impairment.type.toUpperCase()} `,
                    `[<t:${dayjs.utc(impairment.issuedAt).unix()}:s>] - ${impairment.reason}`,
                    `\n  - Issued by: @${issuer?.username ?? 'unknown'} [\`${impairment.issuedBy}\`] `,
                    `// ${impairment.authority} [${impairment.guildId ? `\`${impairment.guildId}\`` : 'Unknown Guild'}]`,
                    `\n  - Evidence: ${impairment.evidence.map((url, index) => `[Attachment ${index + 1}](${url})`).join(', ')}`
                );
            };
        } else safetyLines.push(
            `\n${user} has no safety flags or restrictions.`
        );

        const container = createContainer([
            createTextSection(infoLines.join('\n'), { type: 'thumbnail', url: user.avatarURL() }),
            createSeparator(),
            createTextDisplay(profilesLines.join('\n')),
            createSeparator(),
            createTextDisplay(safetyLines.join(''))
        ]);

        await context.editOrReply({
            flags: MessageFlags.IsComponentsV2,
            components: [createTextDisplay(`<@1350451983022166158> whois ${user}`), container],
            allowed_mentions: { users: ['1350451983022166158'] }
        });
    };
};
