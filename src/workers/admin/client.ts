import { ClientOptions, Client as SeyfertClient } from 'seyfert';
import plugins from './plugins.js';

export default class Client extends SeyfertClient<typeof plugins, true> {
    public packet = this.onPacket.bind(this);

    constructor(options?: ClientOptions) {
        super(options);
    };
};
