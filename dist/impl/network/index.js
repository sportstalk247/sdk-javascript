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
exports.NetworkHandler = exports.bindJWTUpdates = exports.stRequest = void 0;
var axios_1 = require("axios");
/**
 * Make request with fetch. Originally axios was used everywhere for compatibility but this caused more errors with modern browsers as
 * Axios default cors handling was not as flexible.
 * @param config
 */
//@ts-ignore
var makeRequest = function makeRequest(config) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // @ts-ignore
            if (config.data) {
                // @ts-ignore
                config.body = JSON.stringify(config.data);
            }
            config.headers['Content-Type'] = 'application/json';
            // @ts-ignore
            return [2 /*return*/, window.fetch(config.url, config).then(function (response) {
                    if (response.ok) {
                        return response.json();
                    }
                    else {
                        var error = new Error(response.statusText);
                        // @ts-ignore
                        error.response = {
                            status: response.status
                        };
                        throw error;
                    }
                })];
        });
    });
};
/**
 * Make request with axios on server
 * @param config
 */
var makeAxiosRequest = function makeAxiosRequest(config, errorHandlerfunction) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (config && config.headers) {
                // @ts-ignore
                config.decompress = true;
            }
            return [2 /*return*/, axios_1.default(config).then(function (result) { return result.data; }).catch(function (e) {
                    if (errorHandlerfunction) {
                        return errorHandlerfunction(e);
                    }
                    throw e;
                })];
        });
    });
};
function getRequestLibrary() {
    //@ts-ignore
    if (typeof window !== "undefined" && window.fetch) {
        return makeRequest;
    }
    return makeAxiosRequest;
}
exports.stRequest = getRequestLibrary();
exports.bindJWTUpdates = function (target) { return function (config, errorHandlerfunction) { return __awaiter(void 0, void 0, void 0, function () {
    var exp;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                exp = target.getTokenExp();
                if (!(exp && exp < new Date().getTime() - 20)) return [3 /*break*/, 2];
                return [4 /*yield*/, target.refreshUserToken()];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2: return [2 /*return*/, exports.stRequest(config, errorHandlerfunction)];
        }
    });
}); }; };
var NetworkHandler = /** @class */ (function () {
    function NetworkHandler(_a) {
        var headers = _a.headers, apiKey = _a.apiKey, Authorization = _a.Authorization;
        this.post = function (url, data, onError, options) {
        };
        this.get = function (url, query, onError, options) {
        };
        this.put = function (url, data, options) {
        };
        this.delete = function (url, data, options) {
        };
        this._apiKey = apiKey;
        this.Authorization = Authorization;
    }
    return NetworkHandler;
}());
exports.NetworkHandler = NetworkHandler;
//# sourceMappingURL=index.js.map