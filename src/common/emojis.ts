function resolveEmoji(prod: string, dev: string): string {
    return process.env.DISCORD_APP_ID === '1110843086805930014' ? prod : dev;
};

export default {
    error: `<:es_error:${resolveEmoji('1286666110221160449', '1286666588640116766')}>`,
    success: `<:es_success:${resolveEmoji('1286666101744205854', '1286666586987565087')}>`
};
