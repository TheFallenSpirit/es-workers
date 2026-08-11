import { createMiddleware } from 'seyfert';
import { getProfile } from '../../../store/profile.js';
import { removeReaction } from '../common.js';

export default createMiddleware<void>(async ({ next, context }) => {
    const profile = await getProfile(context.author.id);
    if (!profile) return removeReaction(context);

    const whitelistedUsers = context.command.props.whitelistedUsers;
    if (whitelistedUsers && whitelistedUsers.includes(context.author.id)) return next();
    
    if (!profile.permissionLevel || profile.permissionLevel < 4) return removeReaction(context);
    const commandPermission = context.command.props.permissionLevel;

    if (!commandPermission) {
        await removeReaction(context);
        return context.editOrReply({
            content: `The selected command doesn't have a valid permission level (internal error).`
        });
    };

    if (profile.permissionLevel < commandPermission) return removeReaction(context);
    next();
});
