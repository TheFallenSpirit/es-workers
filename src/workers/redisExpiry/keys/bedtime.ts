import queueMessage from '../../../common/queue.js';

export default async (key: string) => {
    const userId = key.split(':').at(-1);
    if (!userId) return;

    await queueMessage('general', {
        userId,
        options: {
            content: `Your bedtime has ended 🎉! Any bedtime impairments and restrictions you had have been lifted.`
        }
    });
};
