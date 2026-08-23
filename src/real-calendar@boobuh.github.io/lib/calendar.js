/**
 * International Fixed Calendar (13 × 28), with a continuous 7-day week.
 *
 * Months are 28 days. Sol sits between June and July. Year Day follows
 * December 28 (Gregorian 31 Dec). Leap Day follows June 28 in leap years
 * (Gregorian day-of-year 169) and still has a weekday — the week never skips.
 */

export const MONTHS = Object.freeze([
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'Sol',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
]);

export const WEEKDAYS = Object.freeze([
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
]);

export const WEEKDAY_SHORT = Object.freeze([
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
]);

export const WEEKDAY_LETTERS = Object.freeze(['S', 'M', 'T', 'W', 'T', 'F', 'S']);

export const MONTHS_PER_YEAR = 13;
export const DAYS_PER_MONTH = 28;

const GREGORIAN_MONTH_DAYS = Object.freeze([
    31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
]);

export function isGregorianLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function dayOfYear(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    let total = date.getDate();
    for (let i = 0; i < month; i++) {
        total += GREGORIAN_MONTH_DAYS[i];
        if (i === 1 && isGregorianLeapYear(year))
            total += 1;
    }
    return total;
}

export function dateFromDayOfYear(year, doy) {
    return new Date(year, 0, doy);
}

export function leapDayDate(year) {
    if (!isGregorianLeapYear(year))
        return null;
    return dateFromDayOfYear(year, 169);
}

export function yearDayDate(year) {
    return dateFromDayOfYear(year, isGregorianLeapYear(year) ? 366 : 365);
}

export function gregorianToReal(date) {
    const year = date.getFullYear();
    const doy = dayOfYear(date);
    const leap = isGregorianLeapYear(year);
    const weekday = date.getDay();
    const gregorian = {
        year,
        month: date.getMonth() + 1,
        day: date.getDate(),
    };

    const base = {
        year,
        weekday,
        weekdayName: WEEKDAYS[weekday],
        weekdayShort: WEEKDAY_SHORT[weekday],
        gregorian,
        isLeapDay: false,
        isYearDay: false,
        month: null,
        day: null,
        monthName: null,
    };

    if (leap && doy === 169) {
        return {
            ...base,
            isLeapDay: true,
            month: 6,
            monthName: 'Leap Day',
        };
    }

    let counted = doy;
    if (leap && doy > 169)
        counted -= 1;

    if (counted === 365) {
        return {
            ...base,
            isYearDay: true,
            month: 13,
            monthName: 'Year Day',
        };
    }

    const month = Math.ceil(counted / DAYS_PER_MONTH);
    const day = ((counted - 1) % DAYS_PER_MONTH) + 1;
    return {
        ...base,
        month,
        day,
        monthName: MONTHS[month - 1],
    };
}

export function realToGregorian(year, month, day) {
    let doy = (month - 1) * DAYS_PER_MONTH + day;
    if (isGregorianLeapYear(year) && month >= 7)
        doy += 1;
    return dateFromDayOfYear(year, doy);
}

export function realDateToGregorian(real) {
    if (real.isLeapDay)
        return leapDayDate(real.year);
    if (real.isYearDay)
        return yearDayDate(real.year);
    return realToGregorian(real.year, real.month, real.day);
}

export function addMonths(year, month, delta) {
    const zero = year * MONTHS_PER_YEAR + (month - 1) + delta;
    const y = Math.floor(zero / MONTHS_PER_YEAR);
    const m = ((zero % MONTHS_PER_YEAR) + MONTHS_PER_YEAR) % MONTHS_PER_YEAR;
    return {year: y, month: m + 1};
}

function sameGregorianDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

export function weekdayLetters(weekStart = 0) {
    return [
        ...WEEKDAY_LETTERS.slice(weekStart),
        ...WEEKDAY_LETTERS.slice(0, weekStart),
    ];
}

export function getMonthCells(year, month, weekStart = 0, today = new Date()) {
    const cells = [];
    const firstG = realToGregorian(year, month, 1);
    const pad = (firstG.getDay() - weekStart + 7) % 7;
    const prev = addMonths(year, month, -1);

    for (let i = 0; i < pad; i++) {
        const day = DAYS_PER_MONTH - pad + 1 + i;
        const gregorian = realToGregorian(prev.year, prev.month, day);
        cells.push({
            year: prev.year,
            month: prev.month,
            day,
            gregorian,
            currentMonth: false,
            isToday: sameGregorianDay(gregorian, today),
            weekday: gregorian.getDay(),
        });
    }

    for (let day = 1; day <= DAYS_PER_MONTH; day++) {
        const gregorian = realToGregorian(year, month, day);
        cells.push({
            year,
            month,
            day,
            gregorian,
            currentMonth: true,
            isToday: sameGregorianDay(gregorian, today),
            weekday: gregorian.getDay(),
        });
    }

    const next = addMonths(year, month, 1);
    const remainder = (7 - (cells.length % 7)) % 7;
    for (let day = 1; day <= remainder; day++) {
        const gregorian = realToGregorian(next.year, next.month, day);
        cells.push({
            year: next.year,
            month: next.month,
            day,
            gregorian,
            currentMonth: false,
            isToday: sameGregorianDay(gregorian, today),
            weekday: gregorian.getDay(),
        });
    }

    return cells;
}

export function formatRealHeading(real) {
    if (real.isYearDay)
        return `${real.weekdayName} Year Day ${real.year}`;
    if (real.isLeapDay)
        return `${real.weekdayName} Leap Day ${real.year}`;
    return `${real.weekdayName} ${real.monthName} ${real.day} ${real.year}`;
}

export function formatRealDateLine(real) {
    if (real.isYearDay)
        return `Year Day ${real.year}`;
    if (real.isLeapDay)
        return `Leap Day ${real.year}`;
    return `${real.monthName} ${real.day} ${real.year}`;
}

export function formatGregorianLine(date) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return `${WEEKDAYS[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
}

export function format24h(date) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
}

export function formatPanelClock(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${WEEKDAY_SHORT[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()} ${format24h(date)}`;
}

export function extraDaysForMonth(year, month) {
    const extras = [];
    if (month === 6 && isGregorianLeapYear(year)) {
        const gregorian = leapDayDate(year);
        extras.push({
            kind: 'leap',
            label: 'Leap Day',
            gregorian,
            isToday: sameGregorianDay(gregorian, new Date()),
        });
    }
    if (month === 13) {
        const gregorian = yearDayDate(year);
        extras.push({
            kind: 'year',
            label: 'Year Day',
            gregorian,
            isToday: sameGregorianDay(gregorian, new Date()),
        });
    }
    return extras;
}
