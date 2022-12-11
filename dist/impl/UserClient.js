"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserClient = void 0;
var RestfulUserService_1 = require("./REST/users/RestfulUserService");
var api_1 = require("./constants/api");
var Moderation_1 = require("../models/Moderation");
/**
 * A class used for managing users.  Typically used by custom management dashboards.
 * @class
 */
var UserClient = /** @class */ (function () {
    function UserClient() {
        var _this = this;
        // Configuration settings
        this._config = { appId: "" };
        /**
         * Sets the user's JWT access token
         * @param userToken
         */
        this.setUserToken = function (userToken) {
            _this._config.userToken = userToken;
            _this.setConfig(_this._config);
        };
        /**
         * Sets a refreshFunction for the user's JWT token.
         * @param refreshFunction
         */
        this.setUserTokenRefreshFunction = function (refreshFunction) {
            _this._config.userTokenRefreshFunction = refreshFunction;
            _this.setConfig(_this._config);
        };
        this.setBanStatus = function (user, isBanned) {
            return _this._userService.setBanStatus(user, isBanned);
        };
        this.setShadowBanStatus = function (user, isShadowBanned, expiryseconds) {
            return _this._userService.setShadowBanStatus(user, isShadowBanned, expiryseconds);
        };
        this.createOrUpdateUser = function (user) {
            return _this._userService.createOrUpdateUser(user);
        };
        this.searchUsers = function (search, type, limit) {
            return _this._userService.searchUsers(search, type, limit);
        };
        this.listUsers = function (request) {
            return _this._userService.listUsers(request);
        };
        this.deleteUser = function (user) {
            return _this._userService.deleteUser(user);
        };
        this.getUserDetails = function (user) {
            return _this._userService.getUserDetails(user);
        };
        this.listUsersInModerationQueue = function (request) {
            return _this._userService.listUsersInModerationQueue(request);
        };
        this.reportUser = function (userToReport, reportedBy, reportType) {
            if (reportType === void 0) { reportType = Moderation_1.ReportType.abuse; }
            return _this._userService.reportUser(userToReport, reportedBy, reportType);
        };
    }
    UserClient.prototype.setConfig = function (config) {
        this._config = Object.assign(api_1.DEFAULT_CONFIG, config);
        this._userService = new RestfulUserService_1.RestfulUserService(this._config);
    };
    UserClient.init = function (config) {
        var client = new UserClient();
        if (config) {
            client.setConfig(config);
        }
        return client;
    };
    return UserClient;
}());
exports.UserClient = UserClient;
//# sourceMappingURL=UserClient.js.map