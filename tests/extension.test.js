import assert from 'node:assert/strict';
import {beforeEach, describe, it, mock} from 'node:test';

import RealCalendarExtension from '../src/real-calendar@boobuh.github.io/extension.js';
import {formatRealDateLine, gregorianToReal} from '../src/real-calendar@boobuh.github.io/lib/calendar.js';
import {makeDateMenu, makeSettings, STOCK_DAY} from './harness/dateMenu.js';
import {panel} from './harness/stubs/main.js';

function setUp({settings = makeSettings(), menu = makeDateMenu()} = {}) {
    panel.statusArea.dateMenu = menu.dateMenu;

    const extension = new RealCalendarExtension({uuid: 'real-calendar@boobuh.github.io'});
    extension.getSettings = () => settings;

    return {extension, settings, ...menu};
}

describe('date menu integration', () => {
    beforeEach(() => {
        mock.restoreAll();
        // The extension logs instead of throwing at GNOME Shell; keep the
        // expected noise out of the test output.
        mock.method(console, 'error', () => {});
    });

    it('adds the 13-month calendar and takes it back out again', () => {
        const t = setUp();
        const originalChildren = t.column.get_children();
        const originalColActors = [...t.layout._colActors];

        t.extension.enable();

        const added = t.column.get_children().filter(c => !originalChildren.includes(c));
        assert.equal(added.length, 2, 'a calendar and a view toggle are added');
        assert.equal(t.layout._colActors.length, originalColActors.length + 2);
        assert.equal(
            t.todayButton._dateLabel.text,
            formatRealDateLine(gregorianToReal(new Date())));

        t.extension.disable();

        assert.deepEqual(t.column.get_children(), originalChildren);
        assert.deepEqual(t.layout._colActors, originalColActors);
        assert.ok(added.every(actor => actor.destroyed));
        assert.equal(t.calendar.visible, true);
        assert.equal(t.settings.handlerCount, 0);
    });

    it('restores the stock today button', () => {
        const t = setUp();

        t.extension.enable();
        assert.ok(Object.hasOwn(t.todayButton, 'setDate'), 'setDate is patched while enabled');

        t.extension.disable();

        assert.equal(Object.hasOwn(t.todayButton, 'setDate'), false,
            'the patch is removed, not replaced with a copy');
        assert.equal(t.todayButton._dayLabel.text, STOCK_DAY);
        assert.match(t.todayButton._dateLabel.text, /^stock /);
    });

    it('leaves the date menu untouched when enabling fails', () => {
        const t = setUp();
        const originalChildren = t.column.get_children();
        const originalColActors = [...t.layout._colActors];
        t.column.insert_child_above = () => {
            throw new Error('shell layout changed');
        };

        assert.throws(() => t.extension.enable(), /shell layout changed/);

        assert.deepEqual(t.column.get_children(), originalChildren);
        assert.deepEqual(t.layout._colActors, originalColActors);
        assert.equal(Object.hasOwn(t.todayButton, 'setDate'), false);
        assert.equal(t.calendar.visible, true);
        assert.equal(t.settings.handlerCount, 0);
    });

    it('refuses to touch a date menu it does not recognise', () => {
        const t = setUp();
        panel.statusArea.dateMenu = {menu: t.menu};

        assert.throws(() => t.extension.enable(), /not laid out/);
        assert.deepEqual(t.layout._colActors.length, 3);
    });

    it('finishes the teardown even when one step fails', () => {
        const t = setUp();
        t.extension.enable();
        const added = t.column.get_children().filter(c => c !== t.calendar &&
            c !== t.todayButton && c !== t.eventsItem);
        t.menu.disconnect = () => {
            throw new Error('already gone');
        };

        t.extension.disable();

        assert.equal(t.layout._colActors.length, 3, 'the column layout is cleaned up');
        assert.ok(added.every(actor => actor.destroyed));
        assert.equal(t.calendar.visible, true);
        assert.equal(Object.hasOwn(t.todayButton, 'setDate'), false);
        assert.ok(console.error.mock.callCount() > 0, 'the failure is logged');
    });

    it('never leaves a destroyed actor for the panel to measure', () => {
        const t = setUp();

        t.extension.enable();
        t.extension.disable();
        assert.doesNotThrow(() => t.layout.getPreferredWidth());

        t.extension.enable();
        // The shell can destroy actors out from under an extension, for
        // example when the date menu itself is rebuilt.
        for (const actor of t.layout._colActors.filter(a => a !== t.calendar &&
            a !== t.todayButton && a !== t.eventsItem))
            actor.destroy();
        assert.doesNotThrow(() => t.layout.getPreferredWidth());

        t.extension.disable();
        assert.doesNotThrow(() => t.layout.getPreferredWidth());
    });

    it('runs on a shell that has no today button', () => {
        const t = setUp({menu: makeDateMenu({withTodayButton: false})});

        assert.doesNotThrow(() => t.extension.enable());
        assert.equal(t.layout._colActors.length, 4);
        assert.doesNotThrow(() => t.extension.disable());
        assert.equal(t.layout._colActors.length, 2);
    });

    it('hides the stock calendar in replace mode and gives it back', () => {
        const t = setUp({settings: makeSettings({'calendar-mode': 'replace'})});

        t.extension.enable();
        assert.equal(t.calendar.visible, false);

        t.extension.disable();
        assert.equal(t.calendar.visible, true);
    });

    it('survives a settings change and a menu opening', () => {
        const t = setUp();
        t.extension.enable();

        assert.doesNotThrow(() => t.settings.set('show-zodiac', false));
        assert.doesNotThrow(() => t.menu.emit('open-state-changed', true));
        assert.doesNotThrow(() => t.menu.emit('open-state-changed', false));

        t.extension.disable();
        assert.doesNotThrow(() => t.layout.getPreferredWidth());
    });
});
