#!/usr/bin/env node

import {
    format24h,
    formatGregorianLine,
    formatPanelClock,
    formatRealHeading,
    gregorianToReal,
} from '../src/real-calendar@boobuh.github.io/lib/calendar.js';
import {formatTimeReadingWithClock} from '../src/real-calendar@boobuh.github.io/lib/timeReading.js';
import {formatSignDetail, getSignForReal} from '../src/real-calendar@boobuh.github.io/lib/zodiac.js';

const input = process.argv[2];
let date;
if (!input) {
    date = new Date();
} else if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [year, month, day] = input.split('-').map(Number);
    date = new Date(year, month - 1, day);
} else {
    date = new Date(input);
}
if (Number.isNaN(date.getTime())) {
    console.error(`Not a date: ${input}`);
    process.exit(1);
}

const real = gregorianToReal(date);
const sign = getSignForReal(real);

console.log(formatRealHeading(real));
console.log(`Gregorian  ${formatGregorianLine(date)}`);
console.log(`Clock      ${formatPanelClock(date)}  (${format24h(date)})`);
console.log(`Zodiac     ${formatSignDetail(sign)}`);
const reading = formatTimeReadingWithClock(date);
if (reading)
    console.log(`369 time   ${reading}`);
