import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {
    formatTimeReading,
    formatTimeReadingWithClock,
    timeReadingDigits,
    TIME_DIGIT_MEANINGS,
} from '../src/real-calendar@boobuh.github.io/lib/timeReading.js';

function at(hours, minutes) {
    return new Date(2026, 7, 23, hours, minutes, 0);
}

describe('timeReadingDigits', () => {
    it('reads 1:34 as 1, 3, 4 and ignores zeros', () => {
        assert.deepEqual(timeReadingDigits(at(1, 34)), [1, 3, 4]);
    });

    it('ignores zero minutes and leading zero hours', () => {
        assert.deepEqual(timeReadingDigits(at(1, 4)), [1, 4]);
        assert.deepEqual(timeReadingDigits(at(0, 34)), [3, 4]);
    });

    it('walks each digit of multi-digit hour and minute', () => {
        assert.deepEqual(timeReadingDigits(at(10, 30)), [1, 3]);
        assert.deepEqual(timeReadingDigits(at(12, 5)), [1, 2, 5]);
    });

    it('returns no digits when the clock is all zeros', () => {
        assert.deepEqual(timeReadingDigits(at(0, 0)), []);
    });
});

describe('formatTimeReading', () => {
    it('maps digits to the 369 chart labels', () => {
        assert.equal(
            formatTimeReading(at(1, 34)),
            '1 Love · 3 Want/Desire · 4 Direction',
        );
    });

    it('includes the clock when requested', () => {
        assert.equal(
            formatTimeReadingWithClock(at(1, 34)),
            '01:34 · 1 Love · 3 Want/Desire · 4 Direction',
        );
    });

    it('covers every digit 1 through 9', () => {
        for (let digit = 1; digit <= 9; digit++)
            assert.ok(TIME_DIGIT_MEANINGS[digit]);
    });
});
