import {
    MONTHS,
    extraDaysForMonth,
    format24h,
    formatGregorianLine,
    formatPanelClock,
    formatRealHeading,
    getMonthCells,
    gregorianToReal,
    weekdayLetters,
} from '../src/real-calendar@boobuh.github.io/lib/calendar.js';
import {formatTimeReading} from '../src/real-calendar@boobuh.github.io/lib/timeReading.js';
import {SIGNS, formatSignDetail, getSignForReal} from '../src/real-calendar@boobuh.github.io/lib/zodiac.js';

const weekStart = 0;
let selected = new Date();
let view = gregorianToView(selected);
let mode = 'real';

const els = {
    clock: document.getElementById('panel-clock'),
    heading: document.getElementById('heading'),
    monthLabel: document.getElementById('month-label'),
    weekdays: document.getElementById('weekdays'),
    grid: document.getElementById('grid'),
    extras: document.getElementById('extras'),
    zodiac: document.getElementById('zodiac'),
    timeReading: document.getElementById('time-reading'),
    hint: document.getElementById('hint'),
    signs: document.getElementById('signs'),
    gregorianBtn: document.getElementById('mode-gregorian'),
    realBtn: document.getElementById('mode-real'),
};

function gregorianToView(date) {
    const real = gregorianToReal(date);
    if (real.isLeapDay)
        return {year: real.year, month: 6};
    if (real.isYearDay)
        return {year: real.year, month: 13};
    return {year: real.year, month: real.month};
}

function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

function toLocalIso(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function fromLocalIso(value) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function tickClock() {
    const now = new Date();
    els.clock.textContent = formatPanelClock(now);
    refreshTimeReading(now);
}

function refreshTimeReading(now = new Date()) {
    const reading = formatTimeReading(now);
    els.timeReading.textContent = reading;
    els.timeReading.hidden = reading.length === 0;
}

function shiftMonth(delta) {
    let month = view.month + delta;
    let year = view.year;
    while (month < 1) {
        month += 13;
        year -= 1;
    }
    while (month > 13) {
        month -= 13;
        year += 1;
    }
    view = {year, month};
    render();
}

function renderSigns(real) {
    els.signs.innerHTML = SIGNS.map(sign => {
        const active = !real.isLeapDay && !real.isYearDay && sign.month === real.month;
        return `<article class="sign${active ? ' active' : ''}">
            <div class="symbol">${sign.symbol}</div>
            <div class="name">${sign.name}</div>
            <div class="meta">${MONTHS[sign.month - 1]} · ${sign.element} · ${sign.gloss}</div>
        </article>`;
    }).join('');
}

function renderGregorian() {
    const date = selected;
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];
    els.heading.textContent = formatGregorianLine(date);
    els.monthLabel.textContent = months[date.getMonth()];
    els.weekdays.innerHTML = weekdayLetters(weekStart).map(l => `<span>${l}</span>`).join('');

    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const pad = (first.getDay() - weekStart + 7) % 7;
    const lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const prevLast = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    const cells = [];
    for (let i = 0; i < pad; i++)
        cells.push({day: prevLast - pad + 1 + i, other: true, date: new Date(date.getFullYear(), date.getMonth() - 1, prevLast - pad + 1 + i)});
    for (let day = 1; day <= lastDate; day++)
        cells.push({day, other: false, date: new Date(date.getFullYear(), date.getMonth(), day)});
    const remainder = (7 - (cells.length % 7)) % 7;
    for (let day = 1; day <= remainder; day++)
        cells.push({day, other: true, date: new Date(date.getFullYear(), date.getMonth() + 1, day)});

    els.grid.innerHTML = cells.map(cell => {
        const classes = [
            cell.other ? 'other' : '',
            sameDay(cell.date, new Date()) ? 'today' : '',
            sameDay(cell.date, selected) ? 'selected' : '',
        ].filter(Boolean).join(' ');
        return `<button type="button" class="${classes}" data-iso="${toLocalIso(cell.date)}">${String(cell.day).padStart(2, '0')}</button>`;
    }).join('');
    els.extras.innerHTML = '';
    const real = gregorianToReal(selected);
    els.zodiac.textContent = formatSignDetail(getSignForReal(real));
    els.hint.textContent = `Real · ${formatRealHeading(real)} · 24h ${format24h(new Date())}`;
    renderSigns(real);
}

function renderReal() {
    const real = gregorianToReal(selected);
    els.heading.textContent = formatRealHeading(real);
    els.monthLabel.textContent = MONTHS[view.month - 1];
    els.weekdays.innerHTML = weekdayLetters(weekStart).map(l => `<span>${l}</span>`).join('');

    const cells = getMonthCells(view.year, view.month, weekStart, new Date());
    els.grid.innerHTML = cells.map(cell => {
        const classes = [
            cell.currentMonth ? '' : 'other',
            cell.isToday ? 'today' : '',
            sameDay(cell.gregorian, selected) ? 'selected' : '',
        ].filter(Boolean).join(' ');
        return `<button type="button" class="${classes}" data-iso="${toLocalIso(cell.gregorian)}">${String(cell.day).padStart(2, '0')}</button>`;
    }).join('');

    els.extras.innerHTML = extraDaysForMonth(view.year, view.month).map(extra => {
        const classes = [
            extra.isToday ? 'today' : '',
            sameDay(extra.gregorian, selected) ? 'selected' : '',
        ].filter(Boolean).join(' ');
        return `<button type="button" class="${classes}" data-iso="${toLocalIso(extra.gregorian)}">${extra.label}</button>`;
    }).join('');

    els.zodiac.textContent = formatSignDetail(getSignForReal(real));
    els.hint.textContent = `Gregorian · ${formatGregorianLine(selected)} · 24h ${format24h(new Date())}`;
    renderSigns(real);
}

function render() {
    if (mode === 'real')
        renderReal();
    else
        renderGregorian();
}

document.getElementById('prev').addEventListener('click', () => {
    if (mode === 'real') {
        shiftMonth(-1);
        return;
    }
    selected = new Date(selected.getFullYear(), selected.getMonth() - 1, 1);
    render();
});
document.getElementById('next').addEventListener('click', () => {
    if (mode === 'real') {
        shiftMonth(1);
        return;
    }
    selected = new Date(selected.getFullYear(), selected.getMonth() + 1, 1);
    render();
});

els.grid.addEventListener('click', event => {
    const button = event.target.closest('button[data-iso]');
    if (!button)
        return;
    selected = fromLocalIso(button.dataset.iso);
    if (mode === 'real')
        view = gregorianToView(selected);
    render();
});
els.extras.addEventListener('click', event => {
    const button = event.target.closest('button[data-iso]');
    if (!button)
        return;
    selected = fromLocalIso(button.dataset.iso);
    view = gregorianToView(selected);
    render();
});

els.gregorianBtn.addEventListener('click', () => {
    mode = 'gregorian';
    els.gregorianBtn.classList.add('active');
    els.realBtn.classList.remove('active');
    render();
});
els.realBtn.addEventListener('click', () => {
    mode = 'real';
    els.realBtn.classList.add('active');
    els.gregorianBtn.classList.remove('active');
    view = gregorianToView(selected);
    render();
});

tickClock();
setInterval(tickClock, 1000);
render();
