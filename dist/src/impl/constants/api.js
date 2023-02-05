"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = exports.DELETE = exports.GET = exports.POST = exports.DEFAULT_CONFIG = exports.CONTENT_TYPE = exports.API_SUCCESS_MESSAGE = exports.AUTHORIZATION_HEADER = exports.API_TOKEN_HEADER = exports.APPLICATION_JSON = exports.FORM_ENCODED = exports.DEFAULT_ENDPOINT = void 0;
exports.DEFAULT_ENDPOINT = 'https://api.sportstalk247.com/api/v3';
exports.FORM_ENCODED = 'application/x-www-form-urlencoded';
exports.APPLICATION_JSON = 'application/json';
exports.API_TOKEN_HEADER = "x-api-token";
exports.AUTHORIZATION_HEADER = "Authorization";
exports.API_SUCCESS_MESSAGE = "Success";
exports.CONTENT_TYPE = 'Content-Type';
exports.DEFAULT_CONFIG = {
    endpoint: exports.DEFAULT_ENDPOINT,
    smoothEventUpdates: true
};
Object.freeze(exports.DEFAULT_CONFIG);
exports.POST = 'POST';
exports.GET = 'GET';
exports.DELETE = 'DELETE';
exports.PUT = 'PUT';
//# sourceMappingURL=api.js.map