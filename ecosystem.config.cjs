const options = {
    node_args: '-r dotenv/config'
};

module.exports = {
    apps: [
        { name: 'ES Cron Worker', script: './build/workers/cron/index.js', ...options },
        { name: 'ES Queue Worker', script: './build/workers/queue/index.js', ...options },
        { name: 'ES Redis Expiry Worker', script: './build/workers/redisExpiry/index.js', ...options }
    ]
};
