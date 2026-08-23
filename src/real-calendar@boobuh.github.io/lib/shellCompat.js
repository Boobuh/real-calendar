/**
 * Helpers for the parts of St that differ between the shell versions listed in
 * metadata.json.
 */

import Clutter from 'gi://Clutter';
import St from 'gi://St';

/**
 * St.BoxLayout:orientation only exists from GNOME 48 on, and the :vertical
 * property it replaces is deprecated and slated for removal. Use whichever one
 * the running shell understands.
 *
 * @param {St.BoxLayout} box - box to lay out top to bottom
 */
export function setVertical(box) {
    if (typeof box.set_orientation === 'function')
        box.set_orientation(Clutter.Orientation.VERTICAL);
    else
        box.vertical = true;
}

/**
 * @param {object} props - St.BoxLayout construct properties, minus :vertical
 * @returns {St.BoxLayout} a vertical box
 */
export function verticalBox(props = {}) {
    const box = new St.BoxLayout(props);
    setVertical(box);
    return box;
}

/**
 * Runs `fn`, logging instead of throwing. Used wherever a throw would land in
 * GNOME Shell's own call stack (signal handlers, patched shell methods) or
 * would abandon a teardown half-finished.
 *
 * @param {string} what - what the caller was trying to do, for the log line
 * @param {Function} fn - work to attempt
 * @returns {boolean} whether `fn` completed
 */
export function attempt(what, fn) {
    try {
        fn();
        return true;
    } catch (e) {
        console.error(`real-calendar: could not ${what}: ${e}`);
        return false;
    }
}
