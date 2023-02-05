/**
 * A validation error is used when input is wrong.
 */
export declare class ValidationError extends Error {
    constructor(message: string);
}
/**
 * SettingsError is used when settings are missing, such as no appId
 */
export declare class SettingsError extends Error {
    constructor(message: string);
}
/**
 * Require user error is thrown to specify that a User MUST be set for some operations.
 */
export declare class RequireUserError extends Error {
    constructor(m: string);
}
