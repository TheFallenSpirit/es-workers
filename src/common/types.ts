import { APIEmbed, APITopLevelComponent, MessageFlags } from 'seyfert';

export interface MessageQueueItem {
    userId: string;
    options: DiscordMessageOptions;
    notificationType?: string;
}

interface DiscordMessageOptions {
    flags?: MessageFlags;
    embeds?: APIEmbed[];
    content?: string;
    components?: APITopLevelComponent[];
}
