import Shell from 'gi://Shell';
import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {RealCalendarWidget} from './calendarWidget.js';
import {formatRealDateLine, gregorianToReal} from './lib/calendar.js';

export default class RealCalendarExtension extends Extension {
    enable() {
        this._dateMenu = Main.panel.statusArea.dateMenu;
        this._stockCalendar = this._dateMenu._calendar;
        this._column = this._stockCalendar.get_parent();
        this._settings = this.getSettings();
        this._view = 'real';
        this._weekStart = Shell.util_get_week_start();

        this._toggle = new St.BoxLayout({
            style_class: 'real-calendar-mode-toggle',
            x_expand: true,
        });
        this._gregorianBtn = new St.Button({
            style_class: 'real-calendar-mode-button',
            can_focus: true,
            label: 'Gregorian',
            x_expand: true,
        });
        this._realBtn = new St.Button({
            style_class: 'real-calendar-mode-button',
            can_focus: true,
            label: 'Real',
            x_expand: true,
        });
        this._gregorianBtn.connect('clicked', () => this._setView('gregorian'));
        this._realBtn.connect('clicked', () => this._setView('real'));
        this._toggle.add_child(this._gregorianBtn);
        this._toggle.add_child(this._realBtn);

        this._widget = new RealCalendarWidget();
        this._widget.configure({
            weekStart: this._weekStart,
            showZodiac: this._settings.get_boolean('show-zodiac'),
            onSelect: date => this._syncStock(date),
        });

        this._column.insert_child_at_index(this._toggle, 1);
        this._column.insert_child_above(this._widget, this._stockCalendar);

        const layout = this._column.layout_manager;
        this._addedToColActors = [];
        if (layout && Array.isArray(layout._colActors)) {
            for (const actor of [this._toggle, this._widget]) {
                if (!layout._colActors.includes(actor)) {
                    layout._colActors.push(actor);
                    this._addedToColActors.push(actor);
                }
            }
        }

        this._origSetDate = this._dateMenu._date.setDate.bind(this._dateMenu._date);
        this._dateMenu._date.setDate = date => {
            this._origSetDate(date);
            this._applyTodayButton(date);
        };

        this._settingsChangedId = this._settings.connect('changed', () => this._applyMode());
        this._openId = this._dateMenu.menu.connect('open-state-changed', (_menu, isOpen) => {
            if (!isOpen)
                return;
            const now = new Date();
            this._widget.setGregorianDate(now);
            this._applyTodayButton(now);
        });

        this._applyMode();
        this._applyTodayButton(new Date());
    }

    disable() {
        if (this._openId) {
            this._dateMenu.menu.disconnect(this._openId);
            this._openId = 0;
        }
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = 0;
        }
        if (this._origSetDate) {
            this._dateMenu._date.setDate = this._origSetDate;
            this._origSetDate = null;
            this._dateMenu._date.setDate(new Date());
        }

        const layout = this._column?.layout_manager;
        if (layout && Array.isArray(layout._colActors) && this._addedToColActors) {
            layout._colActors = layout._colActors.filter(
                actor => !this._addedToColActors.includes(actor));
        }

        this._stockCalendar.visible = true;
        this._widget?.destroy();
        this._toggle?.destroy();
        this._widget = null;
        this._toggle = null;
        this._gregorianBtn = null;
        this._realBtn = null;
        this._dateMenu = null;
        this._stockCalendar = null;
        this._column = null;
        this._settings = null;
        this._addedToColActors = null;
    }

    _setView(view) {
        this._view = view;
        this._applyMode();
    }

    _applyMode() {
        const replace = this._settings.get_string('calendar-mode') === 'replace';
        const showReal = replace || this._view === 'real';

        this._toggle.visible = !replace;
        this._widget.visible = showReal;
        this._stockCalendar.visible = !showReal;
        this._widget.setShowZodiac(this._settings.get_boolean('show-zodiac'));

        this._gregorianBtn.remove_style_class_name('real-calendar-mode-active');
        this._realBtn.remove_style_class_name('real-calendar-mode-active');
        if (showReal)
            this._realBtn.add_style_class_name('real-calendar-mode-active');
        else
            this._gregorianBtn.add_style_class_name('real-calendar-mode-active');

        this._applyTodayButton(new Date());
    }

    _syncStock(date) {
        this._stockCalendar.setDate(date);
        this._dateMenu._date.setDate(date);
        if (this._dateMenu._eventsItem)
            this._dateMenu._eventsItem.setDate(date);
    }

    _applyTodayButton(date) {
        if (!this._settings)
            return;

        const replace = this._settings.get_string('calendar-mode') === 'replace';
        const showReal = replace || this._view === 'real';
        if (!showReal)
            return;

        const real = gregorianToReal(date);
        const today = this._dateMenu._date;
        if (today._dateLabel)
            today._dateLabel.set_text(formatRealDateLine(real));
        if (today._dayLabel)
            today._dayLabel.set_text(real.weekdayName);
    }
}
