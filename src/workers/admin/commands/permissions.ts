import { Command, CommandContext, createNumberOption, createUserOption, Declare, Options } from 'seyfert';
import { getProfile, updateProfile } from '../../../store/profile.js';

const options = {
    user: createUserOption({
        required: true,
        description: 'The user to update the permission level of.'
    }),
    level: createNumberOption({
        required: true,
        min_value: 0,
        max_value: 8,
        description: 'The new permission level.'
    })
};

@Declare({
    name: 'permissions',
    aliases: ['pl'],
    description: `Change a user's permission level.`,
    props: { permissionLevel: 9, whitelistedUsers: ['738746238874419220'] }
})

@Options(options)

export default class extends Command {
    run = async (context: CommandContext<typeof options>) => {
        const user = context.options.user;
        const profile = await getProfile(user.id);
        if (!profile) return context.editOrReply({ content: 'unregistered' });

        const level = context.options.level;
        if (level === 0) await updateProfile(user.id, { $unset: { permissionLevel: 0 } });
        else await updateProfile(user.id, { $set: { permissionLevel: level } });

        await context.editOrReply({
            content: `Updated permission level for for @${user.username}: \`${level === 0 ? 'null' : level}\`.`
        });
    };
};
