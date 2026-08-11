import { AutoLoad, Command, Declare } from 'seyfert';

@Declare({
    name: 'info',
    description: `View a user's or guild's advanced info.`,
    props: { permissionLevel: 5 }
})

@AutoLoad()

export default class extends Command {};
