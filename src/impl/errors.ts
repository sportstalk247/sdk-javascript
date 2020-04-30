/**
 * A validation error is used when input is wrong.
 */
export class ValidationError extends Error {
    constructor(message:string) {
        super(message);
        Object.setPrototypeOf(this, ValidationError.prototype);
        this.name = "ValidationError";
    }
}

/**
 * SettingsError is used when settings are missing, such as no appId
 */
export class SettingsError extends Error {
    constructor(message:string) {
        super(message);
        Object.setPrototypeOf(this, SettingsError.prototype);
        this.name = "SettingsError";
    }
}

/**
 * Require user error is thrown to specify that a User MUST be set for some operations.
 */
export class RequireUserError extends Error {
    constructor(m: string) {
        super(m);
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, RequireUserError.prototype);
        this.name = "RequireUserError";
    }
}