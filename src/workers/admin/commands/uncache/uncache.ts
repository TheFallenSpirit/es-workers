import { AutoLoad, Command, Declare } from 'seyfert';

@Declare({
    name: 'uncache',
    aliases: ['uc', 'sync'],
    description: `Clear a user's or guild's data from the cache.`,
    props: { permissionLevel: 5 }
})

@AutoLoad()

export default class extends Command {};
