/**
 * 13 equal-month zodiac: one sign per 28-day Real Calendar month.
 * Ophiuchus (the Serpent Bearer) sits between Scorpio and Sagittarius.
 */

export const SIGNS = Object.freeze([
    {month: 1, name: 'Capricorn', symbol: '♑', element: 'Earth', gloss: 'The Sea-Goat'},
    {month: 2, name: 'Aquarius', symbol: '♒', element: 'Air', gloss: 'The Water-Bearer'},
    {month: 3, name: 'Pisces', symbol: '♓', element: 'Water', gloss: 'The Fishes'},
    {month: 4, name: 'Aries', symbol: '♈', element: 'Fire', gloss: 'The Ram'},
    {month: 5, name: 'Taurus', symbol: '♉', element: 'Earth', gloss: 'The Bull'},
    {month: 6, name: 'Gemini', symbol: '♊', element: 'Air', gloss: 'The Twins'},
    {month: 7, name: 'Cancer', symbol: '♋', element: 'Water', gloss: 'The Crab'},
    {month: 8, name: 'Leo', symbol: '♌', element: 'Fire', gloss: 'The Lion'},
    {month: 9, name: 'Virgo', symbol: '♍', element: 'Earth', gloss: 'The Maiden'},
    {month: 10, name: 'Libra', symbol: '♎', element: 'Air', gloss: 'The Scales'},
    {month: 11, name: 'Scorpio', symbol: '♏', element: 'Water', gloss: 'The Scorpion'},
    {month: 12, name: 'Ophiuchus', symbol: '⛎', element: 'Fire', gloss: 'The Serpent Bearer'},
    {month: 13, name: 'Sagittarius', symbol: '♐', element: 'Fire', gloss: 'The Archer'},
]);

export function getSignForMonth(month) {
    if (month < 1 || month > 13)
        return null;
    return SIGNS[month - 1];
}

export function getSignForReal(real) {
    if (real.isLeapDay)
        return {
            ...SIGNS[5],
            name: 'Gemini',
            note: 'Leap Day sits on the Gemini / Cancer threshold after June.',
        };
    if (real.isYearDay)
        return {
            ...SIGNS[12],
            name: 'Sagittarius',
            note: 'Year Day sits on the Sagittarius / Capricorn threshold after December.',
        };
    return getSignForMonth(real.month);
}

export function formatSignLine(sign) {
    if (!sign)
        return '';
    return `${sign.symbol} ${sign.name} · ${sign.gloss}`;
}

export function formatSignDetail(sign) {
    if (!sign)
        return '';
    const note = sign.note ? ` ${sign.note}` : '';
    return `${sign.symbol} ${sign.name} (${sign.element}) — ${sign.gloss}.${note}`;
}
