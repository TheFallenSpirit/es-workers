import { AutoLoad, Command, Declare } from 'seyfert';

@Declare({
    name: 'cooldowns',
    aliases: ['cd'],
    description: `Set or clear a user's cooldowns.`,
    props: { permissionLevel: 7 }
})

@AutoLoad()

export default class extends Command {};
