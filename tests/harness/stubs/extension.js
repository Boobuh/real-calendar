export class Extension {
    constructor(metadata = {}) {
        this.metadata = metadata;
    }

    getSettings() {
        throw new Error('tests must provide their own getSettings()');
    }
}

export function gettext(text) {
    return text;
}
