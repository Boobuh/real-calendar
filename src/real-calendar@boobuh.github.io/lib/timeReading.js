/**
 * 369 time reading: each non-zero clock digit maps to a meaning.
 * Based on the 1–9 chart used in Tesla / vortex time-reading circles.
 */

export const TIME_DIGIT_MEANINGS = Object.freeze({
    1: 'Love',
    2: 'Sharing',
    3: 'Want/Desire',
    4: 'Direction',
    5: 'Person',
    6: 'Positive',
    7: 'Balance',
    8: 'Home/Comfort',
    9: 'Energy/Universe',
});

/**
 * Non-zero digits from the 24-hour clock, in order (hour then minute).
 *
 * @param {Date} date
 * @returns {number[]}
 */
export function timeReadingDigits(date = new Date()) {
    const parts = [date.getHours(), date.getMinutes()];
    const digits = [];
    for (const value of parts) {
        for (const ch of String(value)) {
            if (ch === '0')
                continue;
            digits.push(Number(ch));
        }
    }
    return digits;
}

/**
 * @param {number} digit - 1..9
 * @returns {string|null}
 */
export function meaningForDigit(digit) {
    return TIME_DIGIT_MEANINGS[digit] ?? null;
}

/**
 * @param {Date} date
 * @returns {{digit: number, meaning: string}[]}
 */
export function timeReadingParts(date = new Date()) {
    return timeReadingDigits(date).flatMap(digit => {
        const meaning = meaningForDigit(digit);
        return meaning ? [{digit, meaning}] : [];
    });
}

/**
 * Human-readable line for UI, e.g. "1 Love · 3 Want/Desire · 4 Direction".
 *
 * @param {Date} date
 * @returns {string}
 */
export function formatTimeReading(date = new Date()) {
    const parts = timeReadingParts(date);
    if (parts.length === 0)
        return '';
    return parts.map(({digit, meaning}) => `${digit} ${meaning}`).join(' · ');
}

/**
 * Same reading with the clock time prefixed.
 *
 * @param {Date} date
 * @returns {string}
 */
export function formatTimeReadingWithClock(date = new Date()) {
    const reading = formatTimeReading(date);
    if (!reading)
        return '';
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm} · ${reading}`;
}
