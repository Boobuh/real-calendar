export const ActorAlign = Object.freeze({
    FILL: 0,
    START: 1,
    CENTER: 2,
    END: 3,
});

export const Orientation = Object.freeze({
    HORIZONTAL: 0,
    VERTICAL: 1,
});

export class GridLayout {
    constructor(props = {}) {
        Object.assign(this, props);
        this._container = null;
        this._cells = [];
    }

    attach(actor, column, row, width, height) {
        this._cells.push({actor, column, row, width, height});
        this._container?.add_child(actor);
    }
}

export class BoxLayout {
    constructor(props = {}) {
        Object.assign(this, props);
        this._container = null;
    }
}

export default {ActorAlign, BoxLayout, GridLayout, Orientation};
