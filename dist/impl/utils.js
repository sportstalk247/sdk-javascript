"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallBackDelegate = exports.forceObjKeyOrString = exports.getJSONHeaders = exports.getUrlEncodedHeaders = exports.buildAPI = exports.queryStringify = exports.formify = void 0;
var api_1 = require("./constants/api");
var errors_1 = require("./errors");
function formify(data) {
    var formBody = [];
    for (var property in data) {
        var encodedKey = property;
        // If null/undefined/empty value, skip this.  Need careful check in case value is a number and is zero.
        if (data[property] === undefined || data[property] === null || data[property] === NaN) {
            continue;
        }
        var encodedValue = encodeURIComponent(data[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    return formBody.join("&");
}
exports.formify = formify;
function queryStringify(data, key) {
    var formBody = [];
    for (var property in data) {
        var encodedKey = key || property;
        // If null/undefined/empty value, skip this.  Need careful check in case value is a number and is zero.
        if (data[property] === undefined || data[property] === null || data[property] === NaN) {
            continue;
        }
        if (Array.isArray(data[property])) {
            formBody.push(queryStringify(data[property], property));
        }
        else {
            var encodedValue = encodeURIComponent(data[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
    }
    return formBody.join("&");
}
exports.queryStringify = queryStringify;
function buildAPI(config, ext, request) {
    var endpoint = (config.endpoint || api_1.DEFAULT_CONFIG.endpoint) + "/" + config.appId + "/" + ext;
    if (request && Object.keys(request).length > 0) {
        endpoint = endpoint + "?" + formify(request);
    }
    return endpoint;
}
exports.buildAPI = buildAPI;
/**
 * Gets proper API headers with optional token.
 * Without the token, most requests do not require CORS, however you will need to provide a token injection proxy.
 * @param apiKey
 */
function getUrlEncodedHeaders(apiKey, userToken) {
    var headers = {
        'Content-Type': api_1.FORM_ENCODED,
    };
    if (apiKey) {
        headers[api_1.API_TOKEN_HEADER] = apiKey;
    }
    if (userToken) {
        headers[api_1.AUTHORIZATION_HEADER] = userToken;
    }
    return headers;
}
exports.getUrlEncodedHeaders = getUrlEncodedHeaders;
function getJSONHeaders(apiKey, userToken) {
    var headers = {
        'Content-Type': api_1.APPLICATION_JSON // causes issues in browsers with cors, but not necessary for server.
    };
    if (apiKey) {
        headers[api_1.API_TOKEN_HEADER] = apiKey;
    }
    if (userToken) {
        headers[api_1.AUTHORIZATION_HEADER] = "Bearer " + userToken;
    }
    return headers;
}
exports.getJSONHeaders = getJSONHeaders;
function forceObjKeyOrString(obj, key) {
    if (key === void 0) { key = 'id'; }
    var val = obj[key] || obj;
    if (typeof val === 'string') {
        return val;
    }
    throw new errors_1.ValidationError("Missing required string property " + key);
}
exports.forceObjKeyOrString = forceObjKeyOrString;
var CallBackDelegate = /** @class */ (function () {
    function CallBackDelegate(target, func) {
        var _this = this;
        this.callback = function (jwt) { return __awaiter(_this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._func.call(this._target, jwt)];
                    case 1:
                        token = _a.sent();
                        this._target.setUserToken(token);
                        return [2 /*return*/, token];
                }
            });
        }); };
        this.setCallback = function (func) {
            _this._func = func;
        };
        this._target = target;
        this._func = func;
    }
    return CallBackDelegate;
}());
exports.CallBackDelegate = CallBackDelegate;
//# sourceMappingURL=utils.js.map