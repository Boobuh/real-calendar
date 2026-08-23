import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {
    MONTHS,
    addMonths,
    dayOfYear,
    extraDaysForMonth,
    gregorianToReal,
    isGregorianLeapYear,
    leapDayDate,
    realDateToGregorian,
    realToGregorian,
    yearDayDate,
} from '../src/real-calendar@boobuh.github.io/lib/calendar.js';
import {SIGNS, getSignForMonth, getSignForReal} from '../src/real-calendar@boobuh.github.io/lib/zodiac.js';

describe('leap years', () => {
    it('treats 2024 and 2028 as leap years and 2026 as common', () => {
        assert.equal(isGregorianLeapYear(2024), true);
        assert.equal(isGregorianLeapYear(2026), false);
        assert.equal(isGregorianLeapYear(1900), false);
        assert.equal(isGregorianLeapYear(2000), true);
    });
});

describe('gregorianToReal', () => {
    it('maps 1 January to January 1', () => {
        const real = gregorianToReal(new Date(2026, 0, 1));
        assert.equal(real.month, 1);
        assert.equal(real.day, 1);
        assert.equal(real.monthName, 'January');
        assert.equal(real.isYearDay, false);
    });

    it('maps 23 August 2026 to Real August 11', () => {
        const real = gregorianToReal(new Date(2026, 7, 23));
        assert.equal(dayOfYear(new Date(2026, 7, 23)), 235);
        assert.equal(real.month, 9);
        assert.equal(real.day, 11);
        assert.equal(real.monthName, 'August');
        assert.equal(real.weekdayName, 'Sunday');
    });

    it('maps 31 December of a common year to Year Day', () => {
        const real = gregorianToReal(new Date(2026, 11, 31));
        assert.equal(real.isYearDay, true);
        assert.equal(real.monthName, 'Year Day');
        assert.equal(real.day, null);
    });

    it('maps day 169 of a leap year to Leap Day', () => {
        const leap = leapDayDate(2024);
        const real = gregorianToReal(leap);
        assert.equal(real.isLeapDay, true);
        assert.equal(real.monthName, 'Leap Day');
        assert.equal(real.weekday, leap.getDay());
    });

    it('keeps a weekday on Year Day and Leap Day', () => {
        const yearDay = gregorianToReal(new Date(2026, 11, 31));
        assert.ok(yearDay.weekday >= 0 && yearDay.weekday <= 6);
        const leap = gregorianToReal(leapDayDate(2024));
        assert.ok(leap.weekday >= 0 && leap.weekday <= 6);
    });

    it('places Sol between June and July', () => {
        assert.deepEqual(MONTHS, [
            'January', 'February', 'March', 'April', 'May', 'June',
            'Sol',
            'July', 'August', 'September', 'October', 'November', 'December',
        ]);
        const sol1 = gregorianToReal(realToGregorian(2026, 7, 1));
        assert.equal(sol1.monthName, 'Sol');
        assert.equal(sol1.day, 1);
    });
});

describe('round trip', () => {
    it('converts every day of 2024 and 2026 back to the same Gregorian date', () => {
        for (const year of [2024, 2026]) {
            const last = isGregorianLeapYear(year) ? 366 : 365;
            for (let doy = 1; doy <= last; doy++) {
                const original = new Date(year, 0, doy);
                const real = gregorianToReal(original);
                const back = realDateToGregorian(real);
                assert.equal(back.getFullYear(), original.getFullYear(), `year doy ${doy}`);
                assert.equal(back.getMonth(), original.getMonth(), `month doy ${doy}`);
                assert.equal(back.getDate(), original.getDate(), `day doy ${doy}`);
            }
        }
    });
});

describe('month arithmetic', () => {
    it('wraps December to January of the next year', () => {
        assert.deepEqual(addMonths(2026, 13, 1), {year: 2027, month: 1});
        assert.deepEqual(addMonths(2026, 1, -1), {year: 2025, month: 13});
        assert.deepEqual(addMonths(2026, 6, 1), {year: 2026, month: 7});
    });

    it('exposes Leap Day on June in leap years and Year Day on December', () => {
        assert.equal(extraDaysForMonth(2024, 6).length, 1);
        assert.equal(extraDaysForMonth(2026, 6).length, 0);
        assert.equal(extraDaysForMonth(2026, 13)[0].label, 'Year Day');
        assert.equal(yearDayDate(2026).getDate(), 31);
    });
});

describe('zodiac', () => {
    it('has thirteen signs including Ophiuchus in November', () => {
        assert.equal(SIGNS.length, 13);
        assert.equal(getSignForMonth(7).name, 'Cancer');
        assert.equal(getSignForMonth(12).name, 'Ophiuchus');
        assert.equal(getSignForMonth(12).symbol, '⛎');
        assert.equal(getSignForMonth(13).name, 'Sagittarius');
    });

    it('assigns the sign of the 13-month date, not the Gregorian month', () => {
        const real = gregorianToReal(new Date(2026, 7, 23));
        assert.equal(getSignForReal(real).name, 'Virgo');
    });
});
