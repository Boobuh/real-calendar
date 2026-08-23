import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const MODES = ['second', 'replace'];

export default class RealCalendarPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: _('Real Calendar'),
            icon_name: 'x-office-calendar-symbolic',
        });

        const group = new Adw.PreferencesGroup({
            title: _('Date menu'),
            description: _('The 24-hour clock and the seven-day week stay as they are. This extension only changes how months and zodiac dates are shown.'),
        });
        page.add(group);

        const modeRow = new Adw.ComboRow({
            title: _('Calendar display'),
            subtitle: _('Keep GNOME’s calendar and switch in the date menu, or replace it.'),
            model: Gtk.StringList.new([
                _('Second option (toggle in the date menu)'),
                _('Replace the default calendar'),
            ]),
        });
        const current = settings.get_string('calendar-mode');
        modeRow.selected = Math.max(0, MODES.indexOf(current));
        modeRow.connect('notify::selected', () => {
            settings.set_string('calendar-mode', MODES[modeRow.selected]);
        });
        group.add(modeRow);

        const zodiac = new Adw.SwitchRow({
            title: _('Show zodiac'),
            subtitle: _('Thirteen signs, including Ophiuchus, one per 28-day month.'),
        });
        settings.bind('show-zodiac', zodiac, 'active', Gio.SettingsBindFlags.DEFAULT);
        group.add(zodiac);

        window.add(page);
    }
}
