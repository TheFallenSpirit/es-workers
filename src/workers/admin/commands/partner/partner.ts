import { AutoLoad, Command, createStringOption, Declare } from 'seyfert';

@Declare({
    name: 'partner',
    description: 'Manage partnered servers and partner applications.',
    props: { permissionLevel: 5 }
})

@AutoLoad()

export default class extends Command {};

export const guildOption = createStringOption({
    required: true,
    description: 'The guild ID to manage.'
});
