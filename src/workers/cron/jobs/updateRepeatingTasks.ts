import { CronOnCompleteCallback } from 'cron';
import dayjs from 'dayjs';
import Task from '../../../common/models/Task.js';
import queueMessage from '../../../common/queue.js';
import { updateTask } from '../../../store/task.js';
import emojis from '../../../common/emojis.js';

export default async (done: CronOnCompleteCallback) => {
    const now = dayjs.utc().startOf('day');

    const tasks = await Task.find({
        due: { $lte: now.toDate() },
        repeat: { $exists: true, $ne: null },
        archived: { $ne: true }
    }).lean();

    for await (const task of tasks) {
        const emoji = task.completedAt ? emojis.success : emojis.error;
        const completed = task.completedAt ? 'completed successfully' : 'not completed';
        const repeatSchedule = `It will repeat ${taskRepeat(task.repeat!)}`;

        if (task.assignedBy) await queueMessage('general', {
            userId: task.assignedBy,
            options: {
                content: `${emoji} Task #${task.fId} (${task.name}) for <@${task.user}> was ${completed}. ${repeatSchedule}`
            }
        });

        await queueMessage('general', {
            userId: task.user,
            options: { content: `${emoji} Task #${task.fId} (${task.name}) was ${completed}. ${repeatSchedule}` }
        });

        await updateTask(task._id, {
            $set: { due: now.add(task.repeat!, 'h').toDate() },
            $unset: { completedAt: '' }
        });
    };

    done();
};

function taskRepeat(repeat: number): string {
    switch (repeat) {
        case 24: return 'daily';
	    case 168: return 'weekly';
	    case 336: return 'bi-weekly';
        default: return 'unknown';
    };
};
