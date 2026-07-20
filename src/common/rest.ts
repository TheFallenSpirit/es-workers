import { ApiHandler } from 'seyfert';

export default new ApiHandler({
    token: process.env.DISCORD_TOKEN ?? ''
}).proxy;
