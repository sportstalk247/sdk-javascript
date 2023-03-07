"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestfulChatModerationService = void 0;
var network_1 = require("../../network");
var utils_1 = require("../../utils");
var api_1 = require("../../constants/api");
/**
 * This class is for moderating chat events.  Most clients will not need this unless you are building a custom moderation UI.
 * @class
 */
var RestfulChatModerationService = /** @class */ (function () {
    function RestfulChatModerationService(config) {
        var _this = this;
        this._config = { appId: "" };
        this._apiExt = 'chat/moderation/queues/events';
        this._handleRefresh = function () { };
        /**
         * Get the moderation queue of events.
         */
        this.listMessagesInModerationQueue = function (request) {
            if (request === void 0) { request = {}; }
            if (!request) {
                throw new Error("Must submit valid list request");
            }
            var url = utils_1.buildAPI(_this._config, _this._apiExt + "?cursor=" + (request.cursor ? request.cursor : '') + "&roomId=" + (request.roomId ? request.roomId : '') + "&limit=" + (request.limit ? request.limit : ''));
            var config = {
                method: 'GET',
                url: url,
                headers: _this._jsonHeaders
            };
            return network_1.stRequest(config, _this._refreshFn).then(function (result) {
                return result.data;
            });
        };
        /**
         * Reject an event, removing it from the chat.
         * @param event
         */
        this.moderateEvent = function (event, approved) {
            var config = {
                method: 'POST',
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + event.id + "/applydecision"),
                headers: _this._jsonHeaders,
                data: { approve: !!approved + "" }
            };
            return network_1.stRequest(config).then(function (response) { return response.data; });
        };
        this.listRoomEffects = function (room) {
            var roomid = utils_1.forceObjKeyOrString(room);
            var config = {
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, "chat/rooms/" + roomid + "/usereffects"),
                headers: _this._jsonHeaders
            };
            return network_1.stRequest(config).then(function (response) { return response.data; });
        };
        this.applyFlagModerationDecision = function (user, room, approve) {
            var roomid = utils_1.forceObjKeyOrString(room);
            var userid = utils_1.forceObjKeyOrString(user, 'userid');
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, "chat/rooms/" + roomid + "/moderation/flaggedusers/" + userid + "/applydecision"),
                headers: _this._jsonHeaders,
                data: { approve: !!approve + "" }
            };
            return network_1.stRequest(config).then(function (response) { return response.data; });
        };
        this.muteUserInRoom = function (user, room, expireseconds) {
            var roomid = utils_1.forceObjKeyOrString(room);
            var userid = utils_1.forceObjKeyOrString(user, 'userid');
            var data = {
                userid: userid,
                mute: true,
                applyeffect: true
            };
            if (expireseconds) {
                data.expireseconds = expireseconds;
            }
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, "chat/rooms/" + roomid + "/mute"),
                headers: _this._jsonHeaders,
                data: data
            };
            return network_1.stRequest(config).then(function (result) { return result.data; });
        };
        this.unMuteUserInRoom = function (user, room) {
            var roomid = utils_1.forceObjKeyOrString(room);
            var userid = utils_1.forceObjKeyOrString(user, 'userid');
            var data = {
                userid: userid,
                mute: false,
                applyeffect: false
            };
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, "chat/rooms/" + roomid + "/mute"),
                headers: _this._jsonHeaders,
                data: data
            };
            return network_1.stRequest(config).then(function (result) { return result.data; });
        };
        this.shadowbanUserInRoom = function (user, room, expiresSeconds) {
            var roomId = utils_1.forceObjKeyOrString(room);
            var userId = utils_1.forceObjKeyOrString(user, 'userid');
            var data = {
                shadowban: true,
                applyeffect: true,
                userid: userId
            };
            if (expiresSeconds && data.applyeffect) {
                data.expireseconds = expiresSeconds;
            }
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + roomId + "/shadowban"),
                headers: _this._jsonHeaders,
                data: data
            };
            return network_1.stRequest(config).then(function (result) { return result.data; });
        };
        this.unShadowbanUserInRoom = function (user, room) {
            var roomId = utils_1.forceObjKeyOrString(room);
            var userId = utils_1.forceObjKeyOrString(user, 'userid');
            var data = {
                shadowban: false,
                applyeffect: false,
                userid: userId
            };
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + roomId + "/shadowban"),
                headers: _this._jsonHeaders,
                data: data
            };
            return network_1.stRequest(config).then(function (result) { return result.data; });
        };
        this.purgeMessagesInRoom = function (user, room) {
            var roomId = utils_1.forceObjKeyOrString(room);
            var userId = utils_1.forceObjKeyOrString(user, 'userid');
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, "chat/rooms/" + roomId + "/commands/purge/" + userId),
                headers: _this._jsonHeaders
            };
            return network_1.stRequest(config).then(function (result) { return result.data; });
        };
        this.setConfig(config);
    }
    /**
     * Set the configuration
     * @param config
     */
    RestfulChatModerationService.prototype.setConfig = function (config) {
        this._config = Object.assign({}, api_1.DEFAULT_CONFIG, config);
        this._refreshFn = config.userTokenRefreshFunction;
        this._jsonHeaders = utils_1.getJSONHeaders(this._config.apiToken, this._config.userToken);
    };
    return RestfulChatModerationService;
}());
exports.RestfulChatModerationService = RestfulChatModerationService;
//# sourceMappingURL=RestfulChatModerationService.js.map