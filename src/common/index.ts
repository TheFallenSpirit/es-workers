import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import isoWeek from 'dayjs/plugin/isoWeek.js';
import { readFileSync } from 'node:fs';
import { red } from 'seyfert/lib/common/index.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';

export function extendDayjs() {
    dayjs.extend(utc);
    dayjs.extend(isoWeek);
    dayjs.extend(isSameOrAfter);
};

export function validateEnv() {
    const exampleEnv = readFileSync('.env.example').toString();
    const envKeys = exampleEnv.split('\n').map((key) => key.split('=').at(0))
    .filter((key) => typeof key === 'string').filter((key) => key.length > 0);

    for (const key of envKeys) {
        if (process.env[key]) continue;
        console.error(red(`The required environment variable "${key}" wasn't found!`));
        process.exit(1);
    };
};

export function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
