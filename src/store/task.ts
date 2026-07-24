import { UpdateQuery } from 'mongoose';
import Task, { TaskI } from '../common/schemas/Task.js';
import { redis, replacer } from './index.js';
import { seconds } from 'itty-time';

export async function updateTask(taskId: number, query: UpdateQuery<TaskI>): Promise<TaskI> {
    const task = await Task.findByIdAndUpdate(taskId, query, { returnDocument: 'after' });
    if (!task) throw new Error(`Task not found -- ${taskId}`);

    await redis.set(`es_task:${task.user}:${task.fId}`, JSON.stringify(task, replacer), 'EX', seconds('1 week'));
    return task;
};
