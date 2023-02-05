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
exports.RestfulNotificationService = void 0;
var jwt_decode_1 = require("jwt-decode");
var utils_1 = require("../../utils");
var ChatModels_1 = require("../../../models/ChatModels");
var errors_1 = require("../../errors");
var api_1 = require("../../constants/api");
var network_1 = require("../../network");
var RestfulNotificationService = /** @class */ (function () {
    function RestfulNotificationService(config) {
        var _this = this;
        this._jsonHeaders = {};
        this.getCurrentUser = function () {
            return _this._user;
        };
        this.setUserToken = function (token) {
            var decoded = jwt_decode_1.default(token);
            // @ts-ignore
            if (decoded.exp) {
                // @ts-ignore
                _this._tokenExpiry = decoded.exp;
            }
            else {
                _this._tokenExpiry = undefined;
            }
            _this._config.userToken = token;
            _this.setConfig(_this._config);
        };
        this.getUserToken = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._config.userToken || ""];
            });
        }); };
        this.refreshUserToken = function () { return __awaiter(_this, void 0, void 0, function () {
            var newToken;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._config.userToken) {
                            throw new Error('You must set a user token before you can refresh it.  Also ensure that you set a refresh function');
                        }
                        if (!this._config.userTokenRefreshFunction) {
                            throw new Error('You must set a refresh function in order to refresh a userToken. Also ensure that the user token JWT is properly set.');
                        }
                        return [4 /*yield*/, this._config.userTokenRefreshFunction(this._config.userToken)];
                    case 1:
                        newToken = _a.sent();
                        this.setUserToken(newToken);
                        return [2 /*return*/, newToken];
                }
            });
        }); };
        /**
         * Sets the config
         * @param config
         */
        this.setConfig = function (config) {
            _this._config = config;
            _this._jsonHeaders = utils_1.getJSONHeaders(_this._config.apiToken, _this._config.userToken);
        };
        /**
         * Sets a refreshFunction for the user's JWT token.
         * @param refreshFunction
         */
        this.setUserTokenRefreshFunction = function (refreshFunction) {
            _this._config.userTokenRefreshFunction = refreshFunction;
            _this.setConfig(_this._config);
        };
        this.listUserNotifications = function (request) {
            var defaults = {
                limit: 20,
                includeread: false,
                filterNotificationTypes: [ChatModels_1.EventType.speech, ChatModels_1.EventType.reply, ChatModels_1.EventType.reaction]
            };
            var finalRequest = Object.assign(defaults, request);
            if (!finalRequest.userid) {
                throw new errors_1.SettingsError("Must include userid to request notifications");
            }
            if (!finalRequest.filterNotificationTypes || !finalRequest.filterNotificationTypes.length) {
                throw new errors_1.SettingsError("Must include at least one notification type");
            }
            var typeString = '';
            finalRequest.filterNotificationTypes.map(function (type) {
                typeString = typeString + "&filterNotificationTypes=" + type;
            });
            var config = {
                method: api_1.GET,
                headers: _this._jsonHeaders,
                url: utils_1.buildAPI(_this._config, "user/users/" + finalRequest.userid + "/notification/listnotifications?" + typeString + "&limit=" + finalRequest.limit + "&includeread=" + finalRequest.includeread)
            };
            return network_1.stRequest(config).then(function (response) { return response.data; });
        };
        this.setNotificationReadStatus = function (notificationid, userid, read) {
            if (read === void 0) { read = true; }
            var finalRequest = {
                notificationid: notificationid,
                userid: userid,
                read: !!read
            };
            if (!finalRequest.notificationid) {
                throw new Error("Must set notification ID to update notificaiton");
            }
            var params = utils_1.formify(finalRequest);
            var url = utils_1.buildAPI(_this._config, "/user/users/" + finalRequest.userid + "/notification/notifications/" + finalRequest.notificationid + "/update?" + params);
            var config = {
                method: api_1.PUT,
                headers: _this._jsonHeaders,
                url: url
            };
            return network_1.stRequest(config).then(function (response) { return response.data; });
        };
        this._validateNotificationRequest = function (request) {
            if (!request.userid) {
                throw new Error("Must specify userid to set notification status");
            }
            if (!request.notificationid && !request.eventid) {
                throw Error("Must set either notificationid or eventid to delete a notification");
            }
            if (request.notificationid && request.eventid) {
                throw Error("Set either notificationid or eventid, not both");
            }
        };
        this.setNotificationReadStatusByChatEventId = function (chateventid, userid, read) {
            if (read === void 0) { read = true; }
            var finalRequest = {
                chateventid: chateventid,
                userid: userid,
                read: !!read
            };
            _this._validateNotificationRequest(finalRequest);
            var params = utils_1.formify(finalRequest);
            var url;
            if (finalRequest.chateventid) {
                url = utils_1.buildAPI(_this._config, "/user/users/" + finalRequest.userid + "/notification/notifications/" + finalRequest.chateventid + "/update?" + params);
            }
            else {
                throw new Error("Must include chateventid to set read status");
            }
            var config = {
                method: api_1.PUT,
                headers: _this._jsonHeaders,
                url: url
            };
            return network_1.stRequest(config).then(function (response) { return response.data; });
        };
        this.markAllNotificationsAsRead = function (user, deleteAll) {
            if (deleteAll === void 0) { deleteAll = true; }
            var userid = utils_1.forceObjKeyOrString(user, 'userid');
            var config = {
                method: api_1.PUT,
                headers: _this._jsonHeaders,
                url: utils_1.buildAPI(_this._config, "/user/users/" + userid + "/notification/notifications_all/markread?delete=" + deleteAll)
            };
            return network_1.stRequest(config).then(function (response) { return response.data; });
        };
        this.deleteNotification = function (notificationid, userid) { return __awaiter(_this, void 0, void 0, function () {
            var url, config;
            return __generator(this, function (_a) {
                url = utils_1.buildAPI(this._config, "/user/users/" + userid + "/notification/notifications/" + notificationid);
                config = {
                    method: api_1.DELETE,
                    headers: this._jsonHeaders,
                    url: url
                };
                return [2 /*return*/, network_1.stRequest(config).then(function (response) { return response.data; })];
            });
        }); };
        this.deleteNotificationByChatEventId = function (chateventid, userid) { return __awaiter(_this, void 0, void 0, function () {
            var url, config;
            return __generator(this, function (_a) {
                url = utils_1.buildAPI(this._config, "/user/users/" + userid + "/notifications/notificationsbyid/chateventid/" + chateventid);
                config = {
                    method: api_1.DELETE,
                    headers: this._jsonHeaders,
                    url: url
                };
                return [2 /*return*/, network_1.stRequest(config).then(function (response) { return response.data; })];
            });
        }); };
        this.setConfig(config);
    }
    RestfulNotificationService.prototype.getTokenExp = function () {
        return this._tokenExpiry;
    };
    RestfulNotificationService.prototype.setUser = function (user) {
        this._user = user;
    };
    return RestfulNotificationService;
}());
exports.RestfulNotificationService = RestfulNotificationService;
//# sourceMappingURL=RestfulNotificationService.js.map