/**
 * A stand-in for GNOME Shell's date menu, close enough to the real one for the
 * extension's integration code to run against.
 */

import St from './stubs/st.js';

export const STOCK_DAY = 'stock weekday';

/** Mirrors GNOME Shell's CalendarColumnLayout. */
export class CalendarColumnLayout {
    constructor(colActors = []) {
        this._colActors = colActors;
        this._container = null;
    }

    /**
     * The shell measures every actor listed in _colActors on each relayout.
     *
     * @returns {number} the widest column actor
     */
    getPreferredWidth() {
        return this._colActors
            .filter(actor => actor.visible)
            .reduce((widest, actor) => Math.max(widest, actor.get_preferred_width()), 0);
    }
}

/** Mirrors GNOME Shell's TodayButton, whose setDate lives on the prototype. */
export class TodayButton extends St.Button {
    _init(props) {
        super._init(props);
        this._dayLabel = new St.Label();
        this._dateLabel = new St.Label();
        this.add_child(this._dayLabel);
        this.add_child(this._dateLabel);
    }

    setDate(date) {
        this._dayLabel.set_text(STOCK_DAY);
        this._dateLabel.set_text(`stock ${date.getFullYear()}`);
    }
}

export function makeDateMenu({withTodayButton = true} = {}) {
    const calendar = new St.Widget({style_class: 'calendar'});
    calendar.setDate = date => {
        calendar.selectedDate = date;
    };

    const todayButton = withTodayButton ? new TodayButton() : null;
    const eventsItem = new St.Widget();
    eventsItem.setDate = date => {
        eventsItem.selectedDate = date;
    };

    const columnActors = [calendar, todayButton, eventsItem].filter(Boolean);
    const layout = new CalendarColumnLayout([...columnActors]);
    const column = new St.Widget({layout_manager: layout});
    for (const actor of columnActors)
        column.add_child(actor);

    todayButton?.setDate(new Date());

    const menu = new St.Widget();
    const dateMenu = {
        menu,
        _calendar: calendar,
        _date: todayButton,
        _eventsItem: eventsItem,
    };

    return {calendar, column, dateMenu, eventsItem, layout, menu, todayButton};
}

export function makeSettings(overrides = {}) {
    const values = {'calendar-mode': 'second', 'show-zodiac': true, ...overrides};
    const handlers = new Map();
    let nextId = 1;

    return {
        get_string: key => values[key],
        get_boolean: key => values[key],
        set(key, value) {
            values[key] = value;
            for (const callback of [...handlers.values()])
                callback();
        },
        connect(_signal, callback) {
            const id = nextId++;
            handlers.set(id, callback);
            return id;
        },
        disconnect(id) {
            handlers.delete(id);
        },
        get handlerCount() {
            return handlers.size;
        },
    };
}
