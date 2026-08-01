import { config } from 'seyfert';

export default config.bot({
    token: process.env.DISCORD_TOKEN ?? '',
    locations: {
        base: 'build/workers/admin',
        events: 'events',
        commands: 'commands'
    }
});
