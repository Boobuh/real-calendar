import Shell from 'gi://Shell';
import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {RealCalendarWidget} from './calendarWidget.js';
import {formatRealDateLine, gregorianToReal} from './lib/calendar.js';
import {attempt} from './lib/shellCompat.js';

export default class RealCalendarExtension extends Extension {
    enable() {
        try {
            this._build();
        } catch (e) {
            // A half-applied build leaves the date menu broken for the rest of
            // the session, so undo everything before reporting the failure.
            this._teardown();
            throw e;
        }
    }

    disable() {
        this._teardown();
    }

    _build() {
        const dateMenu = Main.panel.statusArea?.dateMenu;
        const stockCalendar = dateMenu?._calendar;
        const column = stockCalendar?.get_parent();
        if (!dateMenu || !stockCalendar || !column) {
            throw new Error('the GNOME date menu is not laid out the way this ' +
                'extension expects, so it was left untouched');
        }

        this._dateMenu = dateMenu;
        this._stockCalendar = stockCalendar;
        this._column = column;
        // Relabelling the today button is a bonus; run without it if the shell
        // no longer exposes the button or its labels.
        this._todayButton = dateMenu._date ?? null;
        this._settings = this.getSettings();
        this._view = 'real';
        this._weekStart = this._getWeekStart();

        this._buildToggle();
        this._buildWidget();

        this._column.insert_child_at_index(this._toggle, 1);
        this._column.insert_child_above(this._widget, this._stockCalendar);
        this._trackInColumnLayout();

        this._patchTodayButton();

        this._settingsChangedId = this._settings.connect('changed',
            () => attempt('apply the new settings', () => this._applyMode()));
        this._openId = this._dateMenu.menu.connect('open-state-changed', (_menu, isOpen) => {
            if (!isOpen)
                return;
            attempt('refresh the calendar', () => {
                const now = new Date();
                this._widget.setGregorianDate(now);
                this._applyTodayButton(now);
            });
        });

        this._applyMode();
        this._applyTodayButton(new Date());
    }

    _teardown() {
        if (this._openId) {
            const menu = this._dateMenu?.menu;
            attempt('disconnect from the date menu', () => menu?.disconnect(this._openId));
            this._openId = 0;
        }
        if (this._settingsChangedId) {
            const settings = this._settings;
            attempt('disconnect from settings', () => settings?.disconnect(this._settingsChangedId));
            this._settingsChangedId = 0;
        }
        this._unpatchTodayButton();

        // Must happen before the actors are destroyed: the column layout
        // measures everything in _colActors, and a destroyed actor left there
        // throws on the panel's next relayout.
        for (const actor of this._addedToColActors ?? [])
            this._forgetColActor(actor);
        this._addedToColActors = null;

        attempt('restore the default calendar', () => {
            if (this._stockCalendar)
                this._stockCalendar.visible = true;
        });
        attempt('remove the 13-month calendar', () => this._widget?.destroy());
        attempt('remove the view toggle', () => this._toggle?.destroy());

        this._widget = null;
        this._toggle = null;
        this._gregorianBtn = null;
        this._realBtn = null;
        this._dateMenu = null;
        this._todayButton = null;
        this._stockCalendar = null;
        this._column = null;
        this._settings = null;
    }

    _getWeekStart() {
        try {
            return Shell.util_get_week_start();
        } catch {
            return 0;
        }
    }

    _buildToggle() {
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
        this._gregorianBtn.connect('clicked',
            () => attempt('show the Gregorian calendar', () => this._setView('gregorian')));
        this._realBtn.connect('clicked',
            () => attempt('show the 13-month calendar', () => this._setView('real')));
        this._toggle.add_child(this._gregorianBtn);
        this._toggle.add_child(this._realBtn);
    }

    _buildWidget() {
        this._widget = new RealCalendarWidget();
        this._widget.configure({
            weekStart: this._weekStart,
            showZodiac: this._settings.get_boolean('show-zodiac'),
            onSelect: date => attempt('follow the selected date',
                () => this._syncStock(date)),
        });
    }

    _trackInColumnLayout() {
        this._addedToColActors = [];

        const colActors = this._column.layout_manager?._colActors;
        if (!Array.isArray(colActors))
            return;

        for (const actor of [this._toggle, this._widget]) {
            if (colActors.includes(actor))
                continue;
            colActors.push(actor);
            this._addedToColActors.push(actor);
            actor.connect('destroy', () => this._forgetColActor(actor));
        }
    }

    _forgetColActor(actor) {
        const layout = this._column?.layout_manager;
        if (Array.isArray(layout?._colActors))
            layout._colActors = layout._colActors.filter(a => a !== actor);
        this._addedToColActors =
            this._addedToColActors?.filter(a => a !== actor) ?? null;
    }

    _patchTodayButton() {
        if (typeof this._todayButton?.setDate !== 'function')
            return;

        this._origSetDate = this._todayButton.setDate.bind(this._todayButton);
        this._patchedSetDate = date => {
            this._origSetDate(date);
            // GNOME Shell is the caller here, so this must never throw.
            attempt('relabel the date menu', () => this._applyTodayButton(date));
        };
        this._todayButton.setDate = this._patchedSetDate;
    }

    _unpatchTodayButton() {
        const original = this._origSetDate;
        const patched = this._patchedSetDate;
        const button = this._todayButton;
        this._origSetDate = null;
        this._patchedSetDate = null;
        if (!original || !button)
            return;

        attempt('restore the date menu label', () => {
            // Leave any patch layered on top of ours alone; calling the
            // original still puts the Gregorian text back.
            if (button.setDate === patched)
                delete button.setDate;
            original(new Date());
        });
    }

    _setView(view) {
        this._view = view;
        this._applyMode();
    }

    _applyMode() {
        if (!this._settings || !this._widget || !this._toggle)
            return;

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
        this._todayButton?.setDate(date);
        if (this._dateMenu._eventsItem)
            this._dateMenu._eventsItem.setDate(date);
    }

    _applyTodayButton(date) {
        if (!this._settings || !this._todayButton)
            return;

        const replace = this._settings.get_string('calendar-mode') === 'replace';
        const showReal = replace || this._view === 'real';
        if (!showReal)
            return;

        const real = gregorianToReal(date);
        if (this._todayButton._dateLabel)
            this._todayButton._dateLabel.set_text(formatRealDateLine(real));
        if (this._todayButton._dayLabel)
            this._todayButton._dayLabel.set_text(real.weekdayName);
    }
}
