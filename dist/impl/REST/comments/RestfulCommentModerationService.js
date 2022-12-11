"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestfulCommentModerationService = void 0;
var network_1 = require("../../network");
var api_1 = require("../../constants/api");
var utils_1 = require("../../utils");
var errors_1 = require("../../errors");
var messages_1 = require("../../constants/messages");
/**
 * Primary REST class for moderating comments.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
var RestfulCommentModerationService = /** @class */ (function () {
    function RestfulCommentModerationService(config) {
        var _this = this;
        this._apiExt = 'comment/moderation/queues/comments';
        /**
         * Used to ensure we have an appID for operations
         * @private
         */
        this._requireAppId = function () {
            if (!_this._config || !_this._config.appId) {
                throw new errors_1.SettingsError(messages_1.MUST_SET_APPID);
            }
        };
        /**
         * Get current config.
         */
        this.getConfig = function () {
            return _this._config;
        };
        /**
         * Set configuration
         * @param config
         */
        this.setConfig = function (config) {
            if (config === void 0) { config = {}; }
            _this._config = Object.assign({}, api_1.DEFAULT_CONFIG, config);
            _this._apiHeaders = utils_1.getUrlEncodedHeaders(_this._config.apiToken, _this._config.userToken);
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
         * Get the moderation queue
         */
        this.listCommentsInModerationQueue = function (cursor) {
            if (cursor === void 0) { cursor = ''; }
            _this._requireAppId();
            var config = {
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "?cursor=" + cursor),
                headers: _this._jsonHeaders,
            };
            return network_1.stRequest(config).then(function (result) {
                return result.data;
            });
        };
        /**
         * Reject a comment, removing it from the comments
         * @param comment
         */
        this.rejectComment = function (comment) {
            var config = {
                method: 'POST',
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + comment.id + "/applydecision"),
                headers: _this._apiHeaders,
                data: utils_1.formify({ approve: false })
            };
            return network_1.stRequest(config).then(function (result) {
                return result.data;
            });
        };
        /**
         * Moderate a comment
         * @param comment
         */
        this.moderateComment = function (comment, approve) {
            var config = {
                method: 'POST',
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + comment.id + "/applydecision"),
                headers: _this._apiHeaders,
                data: utils_1.formify({ approve: approve })
            };
            return network_1.stRequest(config).then(function (result) {
                return result.data;
            });
        };
        /**
         * Approve a comment, allowing it to show in a comments.
         * @param comment
         */
        this.approveComment = function (comment) {
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + comment.id + "/applydecision"),
                headers: _this._apiHeaders,
                data: utils_1.formify({ approve: true })
            };
            return network_1.stRequest(config).then(function (result) {
                return result.data;
            });
        };
        this.setConfig(config);
    }
    return RestfulCommentModerationService;
}());
exports.RestfulCommentModerationService = RestfulCommentModerationService;
//# sourceMappingURL=RestfulCommentModerationService.js.map