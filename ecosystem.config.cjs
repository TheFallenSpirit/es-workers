module.exports = {
    apps: [
        { name: 'ES Cron Worker', script: './build/workers/cron/index.js', node_args: '-r dotenv/config' },
        { name: 'ES Queue Worker', script: './build/workers/queue/index.js', node_args: '-r dotenv/config' },
    ]
};
