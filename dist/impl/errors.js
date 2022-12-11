"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireUserError = exports.SettingsError = exports.ValidationError = void 0;
/**
 * A validation error is used when input is wrong.
 */
var ValidationError = /** @class */ (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, ValidationError.prototype);
        _this.name = "ValidationError";
        return _this;
    }
    return ValidationError;
}(Error));
exports.ValidationError = ValidationError;
/**
 * SettingsError is used when settings are missing, such as no appId
 */
var SettingsError = /** @class */ (function (_super) {
    __extends(SettingsError, _super);
    function SettingsError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, SettingsError.prototype);
        _this.name = "SettingsError";
        return _this;
    }
    return SettingsError;
}(Error));
exports.SettingsError = SettingsError;
/**
 * Require user error is thrown to specify that a User MUST be set for some operations.
 */
var RequireUserError = /** @class */ (function (_super) {
    __extends(RequireUserError, _super);
    function RequireUserError(m) {
        var _this = _super.call(this, m) || this;
        // Set the prototype explicitly.
        Object.setPrototypeOf(_this, RequireUserError.prototype);
        _this.name = "RequireUserError";
        return _this;
    }
    return RequireUserError;
}(Error));
exports.RequireUserError = RequireUserError;
//# sourceMappingURL=errors.js.map