"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestfulUserService = void 0;
var network_1 = require("../../network");
var api_1 = require("../../constants/api");
var utils_1 = require("../../utils");
var User_1 = require("../../../models/user/User");
var Moderation_1 = require("../../../models/Moderation");
/**
 * Class for handling user management via REST.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
var RestfulUserService = /** @class */ (function () {
    function RestfulUserService(config) {
        var _this = this;
        this._apiExt = 'user/users';
        /**
         * Sets the config
         * @param config
         */
        this.setConfig = function (config) {
            _this._config = config;
            _this._jsonHeaders = utils_1.getJSONHeaders(_this._config.apiToken, _this._config.userToken);
        };
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
        /**
         * User Management
         */
        /**
         * If the user exists, updates the user. Otherwise creates a new user.
         * @return user a User
         * @param user a User model.  The values of 'banned', 'handlelowercase' and 'kind' are ignored.
         */
        this.createOrUpdateUser = function (user) {
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + user.userid),
                headers: _this._jsonHeaders,
                data: {
                    userid: user.userid,
                    handle: user.handle,
                    displayname: user.displayname,
                    pictureurl: user.pictureurl,
                    profileurl: user.profileurl,
                    role: user.role || User_1.UserRole.user
                }
            };
            return network_1.stRequest(config).then(function (response) { return response.data; });
        };
        /**
         * Bans or unbans a user.  If isBanned = true the user will be banned (global).  This same command with isBanned = false will unban them.
         * @param user || userid
         * @param isBanned
         */
        this.setBanStatus = function (user, isBanned, expireseconds) {
            // @ts-ignore
            var userid = user.userid || user;
            var url = utils_1.buildAPI(_this._config, _this._apiExt + "/" + userid + "/ban");
            var data = {
                applyeffect: "" + isBanned
            };
            if (expireseconds && isBanned) {
                data.expireseconds = Math.floor(expireseconds);
            }
            var config = {
                method: api_1.POST,
                url: url,
                headers: _this._jsonHeaders,
                data: data,
            };
            return network_1.stRequest(config).then(function (result) {
                return result.data;
            });
        };
        /**
         * Shadowbans (Mutes) a user.  A shadowbanned user's messages will be ignored by the **ChatClient** unless the userid matches the sender.
         *
         * @param user
         * @param isShadowBanned
         * @param expireseconds
         */
        this.setShadowBanStatus = function (user, isShadowBanned, expireseconds) {
            // @ts-ignore
            var userid = user.userid || user;
            var url = utils_1.buildAPI(_this._config, _this._apiExt + "/" + userid + "/shadowban");
            var data = {
                shadowban: "" + isShadowBanned,
                applyeffect: "" + isShadowBanned
            };
            if (expireseconds && isShadowBanned) {
                data.expireseconds = Math.floor(expireseconds);
            }
            var config = {
                method: api_1.POST,
                url: url,
                headers: _this._jsonHeaders,
                data: data
            };
            return network_1.stRequest(config).then(function (result) {
                return result.data;
            });
        };
        /**
         * Search users for this application
         * @param search
         * @param type
         */
        this.searchUsers = function (search, type) {
            var url = utils_1.buildAPI(_this._config, "user/search");
            var data = {
                type: type,
            };
            if (!type || type === User_1.UserSearchType.handle) {
                data.handle = search;
            }
            if (type === User_1.UserSearchType.userid) {
                data.userid = search;
            }
            if (type === User_1.UserSearchType.name) {
                data.name = search;
            }
            var config = {
                method: api_1.POST,
                url: url,
                headers: _this._jsonHeaders,
                data: data
            };
            return network_1.stRequest(config)
                .then(function (response) {
                return response.data;
            });
        };
        /**
         * Delete a user
         * @param user
         */
        this.deleteUser = function (user) {
            // @ts-ignore
            var id = user.userid || user;
            var config = {
                method: api_1.DELETE,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + id),
                headers: _this._jsonHeaders,
            };
            return network_1.stRequest(config).then(function (response) { return response.data; }).catch(function (e) {
                throw new Error(e.response.status + " " + (e.response.data && e.response.data.message ? e.response.data.message : e.response.statusText) + " - " + e.message);
            });
        };
        /**
         * Returns a list of users.  You can provide a ListRequest object to customize the query.
         * @param request a ListRequest
         */
        this.listUsers = function (request) {
            var query = "?";
            if (request) {
                query = query + utils_1.formify(request);
            }
            var config = {
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + query),
                headers: _this._jsonHeaders,
            };
            return network_1.stRequest(config).then(function (response) {
                return response.data;
            }).catch(function (e) {
                throw new Error(e.response.status + " " + (e.response.data && e.response.data.message ? e.response.data.message : e.response.statusText) + " - " + e.message);
            });
        };
        /**
         * Returns a user.
         * @param user either a UserResult or a string representing a userid.  Typically used when you only have the userid.
         */
        this.getUserDetails = function (user) {
            var id = utils_1.forceObjKeyOrString(user, 'userid');
            var config = {
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + id),
                headers: _this._jsonHeaders,
            };
            return network_1.stRequest(config).then(function (response) {
                return response.data;
            }).catch(function (e) {
                throw new Error(e.response.status + " " + (e.response.data && e.response.data.message ? e.response.data.message : e.response.statusText) + " - " + e.message);
            });
        };
        this.reportUser = function (userToReport, reportedBy, reportType) {
            if (reportType === void 0) { reportType = Moderation_1.ReportType.abuse; }
            var userid = utils_1.forceObjKeyOrString(userToReport, 'userid');
            var reporter = utils_1.forceObjKeyOrString(reportedBy, 'userid');
            var data = {
                userid: reporter,
                reporttype: reportType
            };
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, "user/users/" + userid + "/report"),
                headers: _this._jsonHeaders,
                data: data
            };
            return network_1.stRequest(config).then(function (response) { return response.data; }).catch(function (e) {
                throw new Error(e.response.status + " " + (e.response.data && e.response.data.message ? e.response.data.message : e.response.statusText) + " - " + e.message);
            });
        };
        this.listUserSubscribedRooms = function (user, cursor) {
            var userid = utils_1.forceObjKeyOrString(user, 'userid');
            var query = utils_1.formify({ cursor: cursor || '' });
            var config = {
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, "chat/user/" + userid + "/subscriptions?" + query),
                headers: _this._jsonHeaders,
            };
            return network_1.stRequest(config).then(function (response) { return response.data; }).catch(function (e) {
                throw new Error(e.response.status + " " + (e.response.data && e.response.data.message ? e.response.data.message : e.response.statusText) + " - " + e.message);
            });
        };
        this.listUsersInModerationQueue = function (request) {
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, "user/moderation/queues/reportedusers"),
                headers: _this._jsonHeaders,
                data: request
            };
            return network_1.stRequest(config).then(function (response) { return response.data; }).catch(function (e) {
                throw new Error(e.response.status + " " + (e.response.data && e.response.data.message ? e.response.data.message : e.response.statusText) + " - " + e.message);
            });
        };
        this.setConfig(config);
    }
    return RestfulUserService;
}());
exports.RestfulUserService = RestfulUserService;
//# sourceMappingURL=RestfulUserService.js.map