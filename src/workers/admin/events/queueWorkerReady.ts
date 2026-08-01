import { ClientUser, createEvent, UsingClient } from 'seyfert';

export default createEvent({
    run: queueWorkerReady,
    data: { name: 'queueWorkerReady', once: true }
});

async function queueWorkerReady(client: UsingClient) {
    const user = await client.proxy.users('@me').get();
    const application = await client.proxy.applications('@me').get();
    client.me = new ClientUser(client, user, application);
    client.logger.info(`Successfully connected to Discord as ${client.me.tag}.`);
};
