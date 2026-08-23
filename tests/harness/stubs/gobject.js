/**
 * GJS's registerClass returns the class it was given; the stub actors in st.js
 * already call `_init` from their constructor, which is the behaviour the
 * registered classes rely on.
 *
 * @param {object|Function} propsOrClass - class metadata, or the class itself
 * @param {Function} [maybeClass] - the class, when metadata was passed
 * @returns {Function} the registered class
 */
export function registerClass(propsOrClass, maybeClass) {
    return maybeClass ?? propsOrClass;
}

export default {registerClass};
