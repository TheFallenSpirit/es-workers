import { Hono } from 'hono';
import { extendDayjs, validateEnv } from '../../common/index.js';
import { serve } from '@hono/node-server';
import { createHmac, timingSafeEqual } from 'node:crypto';

validateEnv();
extendDayjs();

const app = new Hono();

app.post('/', async (context) => {
    const rawBody = await context.req.arrayBuffer();
    if (!rawBody) return context.json({ error: true, message: 'No request body provided.' }, 401);

    const signatureHeader = context.req.header('X-Signature');
    if (!signatureHeader) return context.json({ error: true, message: 'No signature header provided.' }, 401);

    const hmac = createHmac('sha256', process.env.BILLING_WORKER_LS_SECRET!);
    const digest = Buffer.from(hmac.update(new Uint8Array(rawBody)).digest('hex'), 'utf-8');
    const signature = Buffer.from(signatureHeader, 'utf-8');

    if (digest.length !== signature.length || !timingSafeEqual(digest, signature)) return context.json({
        error: true,
        message: 'Invalid signature header provided.'
    }, 401);

    // const body: WebhookPayload = await context.req.json();
});

const server = serve({
    port: parseInt(process.env.BILLING_WORKER_PORT ?? '7001'),
    fetch: app.fetch
}, (info) => console.log(`Successfully listening on ${info.address}:${info.port}`));

process.on('SIGINT', safeShutdown);
process.on('SIGTERM', safeShutdown);

function safeShutdown(code: 'SIGINT' | 'SIGTERM') {
    console.log(`Received signal "${code}", stopping billing API..`);
    server.close();
    process.exit(0);
};
