import { CronOnCompleteCallback } from 'cron';
import dayjs from 'dayjs';
import Task from '../../../common/schemas/Task.js';
import queueMessage from '../../../common/queue.js';

export default async (done: CronOnCompleteCallback) => {
    const now = dayjs.utc();
    
    const query = {
        due: { $gte: now.toDate(), $lte: now.add(30, 'minutes').toDate() },
        repeat: { $exists: false },
        archived: { $ne: true },
        dueWarned: { $ne: true },
        completedAt: { $exists: false }
    };

    const tasks = await Task.find(query).lean();
    for await (const task of tasks) await queueMessage('general', {
        userId: task.user,
        options: { content: `Task #${task.fId} (${task.name}) is due <t:${dayjs.utc(task.due).unix()}:R>.` }
    });

    await Task.updateMany(query, {
        $set: { dueWarned: true }
    });
    
    done();
};
