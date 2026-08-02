import { ApplicationCommandOptionType, Command, CommandContext, createStringOption, Declare, MessageFlags, Options, SubCommand } from 'seyfert';
import { getProfile } from '../../../store/profile.js';
import { createContainer, createSeparator, createTextDisplay } from '@fallencodes/seyfert-utils/components/message';
import { CommandOptionWithType } from 'seyfert/lib/commands/handle.js';

const prefix = process.argv.includes('--dev') ? '.est' : '.es';

const options = {
    command: createStringOption({
        description: 'The command you want to know more about.'
    })
};

@Declare({
    name: 'help',
    description: 'View a list of admin commands or info about a specific command.',
    props: { permissionLevel: 4 }
})

@Options(options)

export default class extends Command {
    run = async (context: CommandContext<typeof options>) => {
        const profile = await getProfile(context.author.id);
        if (!profile) return;

        const commandName = context.options.command?.trim().toLowerCase();
        const clientCommands = context.client.commands.values.filter((command) => (command instanceof Command));

        if (commandName) {
            const command = clientCommands.find(({ name, aliases }) => {
                return (name === commandName || (aliases && aliases.length > 0 && aliases.includes(commandName)));
            });

            if (!command || command.props.permissionLevel > (profile.permissionLevel ?? 0)) return context.editOrReply({
                content: `the specified command name wasn't found.`
            });

            const lines = [
                `### Command Info - \`${prefix} ${command.name}\`\n`,
                `> ${command.description}\n`
            ];

            const alias = command.aliases?.[0];
            lines.push(`\n**Alias**\n${alias ? `\`${prefix} ${alias}\`` : 'None'}\n`);

            const options = command.options?.filter((option) => {
                return !(option instanceof SubCommand);
            }) as CommandOptionWithType[] | undefined;

            if (options && options.length > 0) lines.push(
                `### Options`,
                ...options.map(({ flag, name, required, description }) => {
                    return `\n- ${flag ? '--' : ''}${name}${required ? '*' : ''} - ${description}`;
                }),
                `\n`
            );

            const subCommands = command.options?.filter((option) => (option instanceof SubCommand));
            if (subCommands && subCommands.length > 0) lines.push(`### Sub Commands`);

            for (const subCommand of subCommands ?? []) {
                const subLines = [`\n- \`${prefix} ${command.name} ${subCommand.name}\``];

                if (subCommand.options && subCommand.options.length > 0) subLines.push(
                    ...subCommand.options.map(({ flag, name, required, description }) => {
                        return `\n  - ${flag ? '--' : ''}${name}${required ? '*' : ''} - ${description}`;
                    })
                );

                lines.push(subLines.join(''));
            };

            const container = createContainer([createTextDisplay(lines.join(''))]);
            return context.editOrReply({ flags: MessageFlags.IsComponentsV2, components: [container] });
        };

        const commands = clientCommands.filter(({ props }) => {
            return (profile.permissionLevel ?? 0) >= (props.permissionLevel ?? 0);
        }).sort(({ options: optionsA }, { options: optionsB }) => {
            const commandAHasSubCommands = (optionsA?.filter(({ type }) => {
                return type === ApplicationCommandOptionType.Subcommand;
            }).length ?? 0) > 0;

            const commandBHasSubcommands = (optionsB?.filter(({ type }) => {
                return type === ApplicationCommandOptionType.Subcommand;
            }).length ?? 0) > 0;

            return Number(!commandBHasSubcommands) - Number(!commandAHasSubCommands);
        });

        const lines = [`### ES Internal Command List`];
        const commandUsage = `${prefix} ${context.command.name}`;

        for (const command of commands) {
            const subCommands = command.options?.filter((option) => {
                return (option instanceof SubCommand);
            }) ?? [];

            const commandLines = [
                subCommands.length > 0 ? '\n' : '',
                `- \`${prefix} ${command.name}\` - ${command.description}`
            ];

            if (subCommands.length > 0) commandLines.push(
                ...mapSubCommandsForList(command.name, subCommands)
            );

            lines.push(commandLines.join(''));
        };

        const container = createContainer([
            createTextDisplay(lines.join('\n')),
            createSeparator(),
            createTextDisplay(`Specify a command name when using \`${commandUsage}\` to view it's options and aliases.`)
        ]);

        await context.editOrReply({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        });
    };
};

function mapSubCommandsForList(commandName: string, subCommands: SubCommand[]): string[] {
    return subCommands.map((sub) => {
        return `\n  - \`${prefix} ${commandName}${sub.group ? ` ${sub.group}` : ''} ${sub.name}\` - ${sub.description}`;
    });
};
