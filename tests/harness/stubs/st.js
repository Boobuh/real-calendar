/**
 * Minimal stand-in for the St actors the extension touches. Only the surface
 * extension.js and calendarWidget.js actually use is modelled.
 */

let nextHandlerId = 1;

export class Widget {
    constructor(props = {}) {
        this._init(props);
    }

    _init(props = {}) {
        this.visible = true;
        this.destroyed = false;
        this._children = [];
        this._parent = null;
        this._handlers = new Map();
        this._styleClasses = new Set();

        const {child, style_class: styleClass, ...rest} = props;
        Object.assign(this, rest);
        if (styleClass) {
            this.style_class = styleClass;
            for (const name of styleClass.split(/\s+/).filter(Boolean))
                this._styleClasses.add(name);
        }
        if (this.layout_manager)
            this.layout_manager._container = this;
        if (child)
            this.add_child(child);
    }

    get_children() {
        return [...this._children];
    }

    get_parent() {
        return this._parent;
    }

    add_child(actor) {
        this.insert_child_at_index(actor, this._children.length);
    }

    insert_child_at_index(actor, index) {
        this._assertAlive();
        actor._parent = this;
        this._children.splice(index, 0, actor);
    }

    insert_child_above(actor, sibling) {
        const index = this._children.indexOf(sibling);
        if (index < 0)
            throw new Error('insert_child_above: sibling is not a child');
        this.insert_child_at_index(actor, index + 1);
    }

    remove_child(actor) {
        const index = this._children.indexOf(actor);
        if (index >= 0)
            this._children.splice(index, 1);
        actor._parent = null;
    }

    destroy_all_children() {
        for (const child of [...this._children])
            child.destroy();
    }

    destroy() {
        if (this.destroyed)
            return;
        this.destroy_all_children();
        this._parent?.remove_child(this);
        this.destroyed = true;
        this.emit('destroy');
        this._handlers.clear();
    }

    /**
     * Stands in for the layout measuring done during a relayout: GNOME Shell
     * raises an error when an already destroyed actor is measured.
     *
     * @returns {number} a fixed width
     */
    get_preferred_width() {
        this._assertAlive();
        return 100;
    }

    connect(signal, callback) {
        const id = nextHandlerId++;
        this._handlers.set(id, {signal, callback});
        return id;
    }

    disconnect(id) {
        this._handlers.delete(id);
    }

    emit(signal, ...args) {
        for (const handler of [...this._handlers.values()]) {
            if (handler.signal === signal)
                handler.callback(this, ...args);
        }
    }

    add_style_class_name(name) {
        this._styleClasses.add(name);
    }

    remove_style_class_name(name) {
        this._styleClasses.delete(name);
    }

    has_style_class_name(name) {
        return this._styleClasses.has(name);
    }

    set_text(text) {
        this.text = text;
    }

    get_text() {
        return this.text;
    }

    _assertAlive() {
        if (this.destroyed)
            throw new Error('actor has already been destroyed');
    }
}

export class BoxLayout extends Widget {
    set_orientation(orientation) {
        this.orientation = orientation;
    }
}

export class Button extends Widget {}
export class Label extends Widget {}
export class Icon extends Widget {}
export class Bin extends Widget {}

export default {Bin, BoxLayout, Button, Icon, Label, Widget};
