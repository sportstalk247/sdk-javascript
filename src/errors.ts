export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}

export class SettingsError extends Error {
    constructor(message) {
        super(message);
        this.name = "SettingsError";
    }
}
