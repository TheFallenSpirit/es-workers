import { ParseClient } from 'seyfert';
import Client from './client.js';
import middlewares from './middlewares/index.js';
import plugins from './plugins.js';

declare module 'seyfert' {
    interface ExtraProps {
        permissionLevel: number;
        whitelistedUsers?: string[];
    }

    interface CustomEvents {
        queueWorkerReady: () => Promise<void>;
    }

    interface InternalOptions {
        withPrefix: true;
    }

    interface SeyfertRegistry {
        client: ParseClient<Client>;
        plugins: typeof plugins;
        middlewares: typeof middlewares;
    }
};
