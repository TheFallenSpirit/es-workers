import { AttachmentBuilder, CommandContext, createBooleanOption, createUserOption, Declare, GuildMember, MessageFlags, Options, SubCommand } from 'seyfert';
import { getProfile } from '../../../../store/profile.js';
import { createContainer, createSeparator, createTextDisplay, createTextSection } from '@fallencodes/seyfert-utils/components/message';
import Safety, { InfractionI } from '../../../../common/models/Safety.js';
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
        const safetyProfile = await Safety.findById(user.id).lean();

        if (safetyProfile) {
            const infractions: InfractionWithIdAndType[] = [];
            for (const [id, infraction] of Object.entries(safetyProfile.restrictions ?? {})) {
                infractions.push({ _id: id, type: 'blacklist', ...infraction });
            };

            for (const [id, infraction] of Object.entries(safetyProfile.flags ?? {})) {
                infractions.push({ _id: id, type: 'flag', ...infraction });
            };

            for await (const infraction of infractions) {
                const issuer = await context.client.users.fetch(
                    infraction.issuedBy
                ).catch(() => undefined);

                safetyLines.push(
                    `\n- ${infraction._id} ${infraction.type.toUpperCase()} `,
                    `[<t:${dayjs.utc(infraction.issuedAt).unix()}:s>] - ${infraction.reason}`,
                    `\n  - Evidence: ${infraction.evidence.map((url, index) => `[Attachment ${index + 1}](${url})`).join(', ')}`,
                    `\n  - Issued by: @${issuer?.username ?? 'unknown'} [\`${infraction.issuedBy}\`] `,
                    `\n  - Authority: ${infraction.authority} [${infraction.guildId ? `\`${infraction.guildId}\`` : 'Unknown Guild'}]`
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

interface InfractionWithIdAndType extends InfractionI {
    _id: string;
    type: string;
}
