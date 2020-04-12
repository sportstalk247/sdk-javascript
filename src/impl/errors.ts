export class ValidationError extends Error {
    constructor(message:string) {
        super(message);
        Object.setPrototypeOf(this, ValidationError.prototype);
        this.name = "ValidationError";
    }
}

export class SettingsError extends Error {
    constructor(message:string) {
        super(message);
        Object.setPrototypeOf(this, SettingsError.prototype);
        this.name = "SettingsError";
    }
}

export class RequireUserError extends Error {
    constructor(m: string) {
        super(m);
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, RequireUserError.prototype);
        this.name = "RequireUserError";
    }
}