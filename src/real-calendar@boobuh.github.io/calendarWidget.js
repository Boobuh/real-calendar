import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import {
    addMonths,
    extraDaysForMonth,
    formatGregorianLine,
    formatRealHeading,
    getMonthCells,
    gregorianToReal,
    MONTHS,
    weekdayLetters,
} from './lib/calendar.js';
import {formatTimeReading} from './lib/timeReading.js';
import {formatSignLine, getSignForReal} from './lib/zodiac.js';

export const RealCalendarWidget = GObject.registerClass({
    GTypeName: 'RealCalendarWidget',
}, class RealCalendarWidget extends St.BoxLayout {
    _init() {
        super._init({
            vertical: true,
            x_expand: true,
            style_class: 'calendar real-calendar',
        });

        this._weekStart = 0;
        this._onSelect = null;
        this._showZodiac = true;

        this._viewYear = null;
        this._viewMonth = null;
        this._selected = new Date();

        this._heading = new St.Label({
            style_class: 'real-calendar-heading',
            x_expand: true,
        });
        this.add_child(this._heading);

        const pager = new St.BoxLayout({
            style_class: 'calendar-month-header real-calendar-pager',
            x_expand: true,
        });
        this._prevButton = new St.Button({
            style_class: 'calendar-change-month back pager-button',
            can_focus: true,
            child: new St.Icon({icon_name: 'pan-start-symbolic'}),
        });
        this._nextButton = new St.Button({
            style_class: 'calendar-change-month forward pager-button',
            can_focus: true,
            child: new St.Icon({icon_name: 'pan-end-symbolic'}),
        });
        this._monthLabel = new St.Label({
            style_class: 'calendar-month-label',
            x_expand: true,
            x_align: Clutter.ActorAlign.CENTER,
        });
        this._prevButton.connect('clicked', () => this._shiftMonth(-1));
        this._nextButton.connect('clicked', () => this._shiftMonth(1));
        pager.add_child(this._prevButton);
        pager.add_child(this._monthLabel);
        pager.add_child(this._nextButton);
        this.add_child(pager);

        this._weekRow = new St.BoxLayout({
            style_class: 'real-calendar-weekdays',
            x_expand: true,
        });
        this.add_child(this._weekRow);

        this._grid = new St.Widget({
            style_class: 'calendar-day-grid real-calendar-grid',
            layout_manager: new Clutter.GridLayout({column_homogeneous: true}),
            x_expand: true,
        });
        this.add_child(this._grid);

        this._extras = new St.BoxLayout({
            vertical: true,
            x_expand: true,
            style_class: 'real-calendar-extras',
        });
        this.add_child(this._extras);

        this._zodiac = new St.Label({
            style_class: 'real-calendar-zodiac',
            x_expand: true,
        });
        this.add_child(this._zodiac);

        this._timeReading = new St.Label({
            style_class: 'real-calendar-time-reading',
            x_expand: true,
        });
        this.add_child(this._timeReading);

        this._gregorianHint = new St.Label({
            style_class: 'real-calendar-gregorian',
            x_expand: true,
        });
        this.add_child(this._gregorianHint);
    }

    configure({weekStart = 0, showZodiac = true, onSelect = null} = {}) {
        this._weekStart = weekStart;
        this._showZodiac = showZodiac;
        this._onSelect = onSelect;
        this.setGregorianDate(new Date());
    }

    setShowZodiac(show) {
        this._showZodiac = show;
        this._refresh();
    }

    setWeekStart(weekStart) {
        this._weekStart = weekStart;
        this._refresh();
    }

    setGregorianDate(date, {syncView = true} = {}) {
        this._selected = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        if (syncView) {
            const real = gregorianToReal(this._selected);
            if (real.isLeapDay) {
                this._viewYear = real.year;
                this._viewMonth = 6;
            } else if (real.isYearDay) {
                this._viewYear = real.year;
                this._viewMonth = 13;
            } else {
                this._viewYear = real.year;
                this._viewMonth = real.month;
            }
        }
        this._refresh();
    }

    _shiftMonth(delta) {
        const next = addMonths(this._viewYear, this._viewMonth, delta);
        this._viewYear = next.year;
        this._viewMonth = next.month;
        this._refresh();
    }

    _selectDate(date) {
        this.setGregorianDate(date, {syncView: true});
        if (this._onSelect)
            this._onSelect(date);
    }

    _refresh() {
        const real = gregorianToReal(this._selected);
        this._heading.text = formatRealHeading(real);
        this._monthLabel.text = MONTHS[this._viewMonth - 1];

        this._weekRow.destroy_all_children();
        for (const letter of weekdayLetters(this._weekStart)) {
            this._weekRow.add_child(new St.Label({
                text: letter,
                style_class: 'calendar-day-heading real-calendar-weekday',
                x_expand: true,
                x_align: Clutter.ActorAlign.CENTER,
            }));
        }

        this._grid.destroy_all_children();
        const layout = this._grid.layout_manager;
        const cells = getMonthCells(this._viewYear, this._viewMonth, this._weekStart, new Date());
        cells.forEach((cell, index) => {
            const col = index % 7;
            const row = Math.floor(index / 7);
            const selected = cell.gregorian.getFullYear() === this._selected.getFullYear() &&
                cell.gregorian.getMonth() === this._selected.getMonth() &&
                cell.gregorian.getDate() === this._selected.getDate();
            const button = new St.Button({
                style_class: 'calendar-day calendar-day-with-events',
                can_focus: true,
                x_expand: true,
                label: String(cell.day).padStart(2, '0'),
            });
            if (!cell.currentMonth)
                button.add_style_class_name('calendar-other-month-day');
            if (cell.isToday)
                button.add_style_class_name('calendar-today');
            if (selected)
                button.add_style_class_name('real-calendar-selected');
            button.connect('clicked', () => this._selectDate(cell.gregorian));
            layout.attach(button, col, row, 1, 1);
        });

        this._extras.destroy_all_children();
        for (const extra of extraDaysForMonth(this._viewYear, this._viewMonth)) {
            const selected = extra.gregorian.getFullYear() === this._selected.getFullYear() &&
                extra.gregorian.getMonth() === this._selected.getMonth() &&
                extra.gregorian.getDate() === this._selected.getDate();
            const button = new St.Button({
                style_class: 'real-calendar-extra-day',
                can_focus: true,
                x_expand: true,
                label: extra.isToday || selected
                    ? `${extra.label} · ${formatGregorianLine(extra.gregorian)}`
                    : extra.label,
            });
            if (extra.isToday)
                button.add_style_class_name('calendar-today');
            if (selected)
                button.add_style_class_name('real-calendar-selected');
            button.connect('clicked', () => this._selectDate(extra.gregorian));
            this._extras.add_child(button);
        }

        const sign = getSignForReal(real);
        this._zodiac.visible = this._showZodiac;
        this._zodiac.text = this._showZodiac ? formatSignLine(sign) : '';
        this.refreshTimeReading();
        this._gregorianHint.text = `Gregorian · ${formatGregorianLine(this._selected)}`;
    }

    refreshTimeReading(now = new Date()) {
        const reading = formatTimeReading(now);
        this._timeReading.visible = reading.length > 0;
        this._timeReading.text = reading;
    }
});
