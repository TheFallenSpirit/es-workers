function resolveEmoji(prod: string, dev: string): string {
    return process.env.DISCORD_APP_ID === '1110843086805930014' ? prod : dev;
};

export default {
    warn: `<:es_warn:${resolveEmoji('1286666062565212281', '1253453316407693433')}>`,
    error: `<:es_error:${resolveEmoji('1286666110221160449', '1286666588640116766')}>`,
    success: `<:es_success:${resolveEmoji('1286666101744205854', '1286666586987565087')}>`
};
