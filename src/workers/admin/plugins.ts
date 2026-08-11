import { definePlugins } from 'seyfert';
import { Yuna } from 'yunaforseyfert';
import { client } from './index.js';

export default definePlugins(
    Yuna.plugin({
        parser: {
            syntax: { namedOptions: ['--'] },
            useUniqueNamedSyntaxAtSameTime: true,
            breakSearchOnConsumeAllOptions: true
        },
        resolver: {
            afterPrepare: () => client.logger.info('Yuna resolver loaded.')
        }
    })
)