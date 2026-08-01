import { CommandContext, createIntegerOption, createStringOption, createUserOption, Declare, Options, Command } from 'seyfert';
import { getProfile, updateProfile } from '../../../store/profile.js';

const options = {
    user: createUserOption({
        required: true,
        description: ''
    }),
    limit: createStringOption({
        required: true,
        description: '',
        choices: [
            { name: 'Subs', value: 'subs' },
            { name: 'Owners', value: 'owners' },
            { name: 'Trusted Users', value: 'authUsers' },
            { name: 'Rules', value: 'rules' },
            { name: 'Custom Gags', value: 'customGags' },
            { name: 'Custom Gag Rules', value: 'customGagRules' }
        ]
    }),
    modifier: createIntegerOption({
        required: true,
        description: ''
    })
};

@Declare({
    name: 'limits',
    aliases: ['modifiers'],
    description: `Update a user's limit modifiers.`,
    props: { permissionLevel: 7 }
})

@Options(options)

export default class extends Command {
    run = async (context: CommandContext<typeof options>) => {
        const user = context.options.user;
        const profile = await getProfile(user.id);
        if (!profile) return context.editOrReply({ content: 'unregistered' });

        const limit = context.options.limit;
        const modifier = context.options.modifier;

        if (modifier === 0) await updateProfile(user.id, { $unset: { [`limitModifiers.${limit}`]: 0 } });
        else await updateProfile(user.id, { $set: { [`limitModifiers.${limit}`]: modifier } });

        await context.editOrReply({
            content: `Updated \`${limit}\` modifier for @${user.username}: ${modifier}.`
        });
    };
};
