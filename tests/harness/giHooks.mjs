/**
 * Node cannot resolve the `gi://` and `resource:///` imports GNOME Shell
 * provides, so map them onto the stubs in tests/harness/stubs. This lets the
 * date-menu integration in extension.js run under `node --test`.
 */

const STUBS = new URL('./stubs/', import.meta.url);

const MODULES = new Map([
    ['gi://Clutter', 'clutter.js'],
    ['gi://GObject', 'gobject.js'],
    ['gi://Shell', 'shell.js'],
    ['gi://St', 'st.js'],
    ['resource:///org/gnome/shell/extensions/extension.js', 'extension.js'],
    ['resource:///org/gnome/shell/ui/main.js', 'main.js'],
]);

export async function resolve(specifier, context, nextResolve) {
    const stub = MODULES.get(specifier);
    if (stub)
        return {url: new URL(stub, STUBS).href, shortCircuit: true};
    return nextResolve(specifier, context);
}
