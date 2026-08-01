import dayjs from 'dayjs';
import parse from 'parse-duration';
import { CommandContext, createStringOption, createUserOption, Declare, Options, SubCommand } from 'seyfert';
import { redis } from '../../../../store/index.js';
import { duration } from 'itty-time';

const options = {
    user: createUserOption({
        required: true,
        description: ''
    }),
    key: createStringOption({
        required: true,
        description: ''
    }),
    duration: createStringOption({
        required: true,
        description: ''
    })
};

@Declare({
    name: 'set',
    description: 'Set a new interaction cooldown for a user.'
})

@Options(options)

export default class extends SubCommand {
    run = async (context: CommandContext<typeof options>) => {
        const durationSeconds = parse(context.options.duration, 's');
        if (!durationSeconds) return context.editOrReply({ content: `the provided duration isn't valid` });

        const key = context.options.key;
        const user = context.options.user;
        const cooldownExpiry = dayjs.utc().add(durationSeconds, 's').unix();
        await redis.set(`es_cooldown_int:${key}:${user.id}`, cooldownExpiry, 'EX', durationSeconds);

        await context.editOrReply({
            content: `Set cooldown key \`${key}\` for @${user.username} to ${duration(durationSeconds * 1000)}.`
        });
    };
};
