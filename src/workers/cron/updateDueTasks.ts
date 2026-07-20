import { CronOnCompleteCallback } from 'cron';
import dayjs from 'dayjs';
import Task from '../../common/schemas/Task.js';
import queueMessage from '../../common/queue.js';

export default async (done: CronOnCompleteCallback) => {
    const query = { due: { $lte: dayjs.utc().toDate() }, repeat: { $exists: false }, archived: { $ne: true } };
    const tasks = await Task.find(query).lean();

    for await (const task of tasks) {
        const completed = task.completedAt ? 'completed successfully' : 'not completed';

        await queueMessage('general', {
            userId: task.user,
            options: { content: `Task #${task.fId} (${task.name}) was ${completed} within the due date.` }
        });

        if (task.assignedBy) await queueMessage('general', {
            userId: task.assignedBy,
            options: {
                content: `Task #${task.fId} (${task.name}) for <@${task.user}> was ${completed} within the due date.`
            }
        });
    };

    await Task.updateMany(query, { $unset: { due: '' } });
    await Task.updateMany({ ...query, completedAt: { $exists: true } }, { $set: { archived: true } });

    done();
};
