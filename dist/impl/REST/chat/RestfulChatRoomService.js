"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestfulChatRoomService = void 0;
var network_1 = require("../../network");
var api_1 = require("../../constants/api");
var utils_1 = require("../../utils");
var errors_1 = require("../../errors");
var Moderation_1 = require("../../../models/Moderation");
/**
 * This room uses REST to manage sportstalk chat rooms.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
var RestfulChatRoomService = /** @class */ (function () {
    function RestfulChatRoomService(config) {
        var _this = this;
        this._apiHeaders = {};
        this._jsonHeaders = {};
        this._apiExt = 'chat/rooms';
        /**
         * Set config
         * @param config
         */
        this.setConfig = function (config) {
            _this._config = config;
            _this._apiHeaders = utils_1.getUrlEncodedHeaders(_this._config.apiToken, _this._config.userToken);
            _this._jsonHeaders = utils_1.getJSONHeaders(_this._config.apiToken, _this._config.userToken);
        };
        /**
         * RoomResult Handling
         */
        this.listRooms = function (cursor, limit) {
            var config = {
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "?cursor=" + (cursor ? cursor : '') + "&limit=" + (limit ? limit : 100)),
                headers: _this._jsonHeaders,
            };
            return network_1.stRequest(config).then(function (result) {
                return result.data;
            });
        };
        /**
         * Delete a room.
         * @param room
         */
        this.deleteRoom = function (room) {
            // @ts-ignore
            var id = utils_1.forceObjKeyOrString(room);
            var config = {
                method: api_1.DELETE,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + id),
                headers: _this._jsonHeaders
            };
            // @ts-ignore
            return network_1.stRequest(config).then(function (result) {
                return result.data;
            });
        };
        /**
         * Create a new room
         * @param room
         */
        this.createRoom = function (room) {
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, _this._apiExt),
                headers: _this._jsonHeaders,
                data: room
            };
            return network_1.stRequest(config).then(function (result) {
                return result.data;
            });
        };
        /**
         *
         * @param {User | string} user - the userobject with userid or just the userid string
         * @param {ChatRoom | string} room - the ChatRoom object with id or just the chatroom roomid.
         * @param {string} cursor - cursor, optional
         * @param {number} limit - result limit, optiona.  Default 100.
         */
        // @ts-ignore
        this.listUserMessages = function (user, room, cursor, limit) {
            if (cursor === void 0) { cursor = ""; }
            if (limit === void 0) { limit = 100; }
            // @ts-ignore
            var roomid = utils_1.forceObjKeyOrString(room);
            var userid = utils_1.forceObjKeyOrString(user, 'userid');
            var url = utils_1.buildAPI(_this._config, _this._apiExt + "/" + roomid + "/messagesbyuser/" + userid + "/?limit=" + (limit ? limit : 100) + "&cursor=" + (cursor ? cursor : ''));
            return network_1.stRequest({
                method: api_1.GET,
                url: url,
                headers: _this._jsonHeaders
            }).then(function (result) {
                return result.data;
            });
        };
        /*
        * List the participants in a room
        * @param {string} cursor
        * @param {number} maxresults
        */
        this.listParticipants = function (room, cursor, maxresults) {
            if (maxresults === void 0) { maxresults = 200; }
            var config = {
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + room.id + "/participants?cursor=" + (cursor ? cursor : '') + "&maxresults=" + (maxresults ? maxresults : 200)),
                headers: _this._jsonHeaders
            };
            return network_1.stRequest(config).then(function (result) { return result.data; });
        };
        /**
         * Join a room
         * @param {string | User} user
         * @param {ChatRoomResult | string} room
         */
        this.joinRoom = function (room, user) {
            // @ts-ignore
            var roomId = utils_1.forceObjKeyOrString(room);
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + roomId + "/join"),
                headers: _this._jsonHeaders,
            };
            if (user && user.userid) {
                config.data = {
                    userId: user.userid,
                    handle: user.handle,
                    displayname: user.displayname || "",
                    pictureurl: user.pictureurl || "",
                    profileurl: user.profileurl || "",
                };
            }
            return network_1.stRequest(config).then(function (response) {
                return response.data;
            });
        };
        /**
         * Returns a specific event for the room
         * @param id
         * @param roomid OPTIONAL.  The room id for the room holding the event. Defaults to the current room. If no value passed and no room set, the method will throw an error.
         */
        this.getEventById = function (eventid, roomid) {
            if (!roomid) {
                throw new errors_1.SettingsError("Cannot retrieve event: No room selected");
            }
            if (!eventid) {
                throw new errors_1.SettingsError("Cannot retrieve event: Invalid event ID");
            }
            var request = {
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + roomid + "/events/" + eventid),
                headers: _this._apiHeaders
            };
            return network_1.stRequest(request).then(function (result) {
                return result.data;
            });
        };
        /**
         * Removes a user from a room.
         * @param user The user to exit from the room, or their ID.
         * @param room The chatroom to exit or it's ID.
         */
        this.exitRoom = function (user, room) {
            var roomId = utils_1.forceObjKeyOrString(room);
            var userId = utils_1.forceObjKeyOrString(user, 'userid');
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + roomId + "/exit"),
                headers: _this._jsonHeaders,
                data: {
                    userid: userId
                }
            };
            return network_1.stRequest(config).then(function (response) {
                return response.message;
            });
        };
        /**
         * Sets a room to be closed.
         * @param room The room to open
         */
        this.closeRoom = function (room) {
            var roomId = utils_1.forceObjKeyOrString(room);
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + roomId),
                headers: _this._jsonHeaders,
                data: { roomisopen: false }
            };
            return network_1.stRequest(config).then(function (response) {
                return response.message;
            });
        };
        /**
         * Sets a room to be open.
         * @param room The room to open
         */
        this.openRoom = function (room) {
            var roomId = utils_1.forceObjKeyOrString(room);
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + roomId),
                headers: _this._jsonHeaders,
                data: { roomisopen: true }
            };
            return network_1.stRequest(config).then(function (response) {
                return response.message;
            });
        };
        /**
         * Will update room settings
         * @param room A ChatRoomResult.  The room must already exist.  All settings sent will be overridden.
         */
        this.updateRoom = function (room) {
            var roomId = utils_1.forceObjKeyOrString(room);
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + roomId),
                headers: _this._jsonHeaders,
                data: room,
            };
            return network_1.stRequest(config).then(function (response) {
                return response.message;
            });
        };
        /**
         * Will retrieve room details
         * @param room A ChatRoomResult object or a room id.
         */
        this.getRoomDetails = function (room) {
            var roomId = utils_1.forceObjKeyOrString(room);
            var config = {
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + roomId),
                headers: _this._jsonHeaders,
            };
            return network_1.stRequest(config).then(function (result) { return result.data; });
        };
        /**
         * Will retrieve the room details.
         * @param room a customid for a room, or a ChatRoomResult with a customID set.
         */
        this.getRoomDetailsByCustomId = function (room) {
            var roomId = utils_1.forceObjKeyOrString(room, 'customid');
            var config = {
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, "chat/roomsbycustomid/" + roomId),
                headers: _this._jsonHeaders,
            };
            return network_1.stRequest(config).then(function (result) { return result.data; });
        };
        /**
         * Will remove all of a user's messages from a room and send a purge event to clients.
         * @param room the ChatRoomResult or a room ID.
         * @param user the User or a userid string.
         */
        this.purgeUserMessagesFromRoom = function (room, user) {
            var roomId = utils_1.forceObjKeyOrString(room, 'id');
            var userId = utils_1.forceObjKeyOrString(user, 'userid');
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, "chat/rooms/" + roomId + "/commands/purge/" + userId),
                headers: _this._jsonHeaders,
            };
            return network_1.stRequest(config);
        };
        /**
         * Removes a user from a room and prevents them from returning. Will add them to the 'bounced users' list on the room.
         * @param room ChatRoomResult or ChatRoom ID
         * @param user User or userid string.
         * @param message The message to show the user explaining the bounce/unbounce.
         */
        this.bounceUserFromRoom = function (room, user, message) {
            var roomId = utils_1.forceObjKeyOrString(room, 'id');
            var userId = utils_1.forceObjKeyOrString(user, 'userid');
            // @ts-ignore
            var announcement = message || "The bouncer shows " + (user.handle || userId) + " the way out.";
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + roomId + "/bounce"),
                headers: _this._jsonHeaders,
                data: {
                    "userid": userId,
                    "bounce": "true",
                    "announcement": announcement
                }
            };
            return network_1.stRequest(config);
        };
        /**
         * Removes a user from the room's bounce list
         * @param {string | ChatRoomResult} room ChatRoomResult or ChatRoom ID
         * @param {string | User} user User or userid string.
         * @param {string} message The message to show the user explaining the bounce/unbounce.
         */
        this.unbounceUserFromRoom = function (room, user, message) {
            var roomId = utils_1.forceObjKeyOrString(room);
            var userId = utils_1.forceObjKeyOrString(user, 'userid');
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + roomId + "/bounce"),
                headers: _this._jsonHeaders,
                data: {
                    "userid": userId,
                    "bounce": "false",
                    "announcement": message || "The bouncer let " + userId + " back in."
                }
            };
            return network_1.stRequest(config);
        };
        /**
         * Gets the extended details of a room
         * @param {ChatRoomExtendedDetailsRequest} request ChatRoomExtendedDetailsRequest properties roomids, customids, entities
         * @return {ChatRoomExtendedDetailsResponse}
         */
        this.getRoomExtendedDetails = function (request) {
            // extract only fields we want in case they send too much.
            var roomids = request.roomids, entities = request.entities, customids = request.customids;
            var query = utils_1.formify({
                roomid: roomids,
                entity: entities,
                customid: customids
            });
            var config = {
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/batch/details?" + query),
                headers: _this._jsonHeaders
            };
            return network_1.stRequest(config).then(function (result) { return result.data; });
        };
        this.setRoomShadowbanStatus = function (user, room, shadowban, expiresSeconds) {
            var roomId = utils_1.forceObjKeyOrString(room);
            var userId = utils_1.forceObjKeyOrString(user, 'userid');
            var data = {
                shadowban: !!shadowban,
                applyeffect: !!shadowban,
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
        this.setRoomMuteStatus = function (user, room, mute, expiresSeconds) {
            var roomId = utils_1.forceObjKeyOrString(room);
            var userId = utils_1.forceObjKeyOrString(user, 'userid');
            var data = {
                applyeffect: !!mute,
                mute: !!mute,
                userid: userId
            };
            if (expiresSeconds && data.applyeffect) {
                data.expireseconds = expiresSeconds;
            }
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + roomId + "/mute"),
                headers: _this._jsonHeaders,
                data: data
            };
            return network_1.stRequest(config).then(function (result) { return result.data; });
        };
        this.reportUser = function (reported, reportedBy, reportType, room) {
            if (reportType === void 0) { reportType = Moderation_1.ReportType.abuse; }
            var userid = utils_1.forceObjKeyOrString(reported, 'userid');
            var reporterid = utils_1.forceObjKeyOrString(reportedBy, 'userid');
            var roomid = utils_1.forceObjKeyOrString(room, 'id');
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, "/chat/rooms/" + roomid + "/users/" + userid + "/report"),
                headers: _this._jsonHeaders,
                data: {
                    userid: reporterid,
                    reporttype: reportType
                }
            };
            return network_1.stRequest(config).then(function (result) { return result.data; });
        };
        this.setConfig(config);
    }
    /**
     * Join a room
     * @param user
     * @param room
     */
    RestfulChatRoomService.prototype.joinRoomByCustomId = function (room, user) {
        // @ts-ignore
        var customId = utils_1.forceObjKeyOrString(room, 'customid');
        var config = {
            method: api_1.POST,
            url: utils_1.buildAPI(this._config, "chat/roomsbycustomid/" + customId + "/join"),
            headers: this._jsonHeaders,
        };
        if (user) {
            config.data = {
                userId: user.userid,
                handle: user.handle,
                displayname: user.displayname || "",
                pictureurl: user.pictureurl || "",
                profileurl: user.profileurl || "",
            };
        }
        return network_1.stRequest(config).then(function (response) {
            return response.data;
        });
    };
    return RestfulChatRoomService;
}());
exports.RestfulChatRoomService = RestfulChatRoomService;
//# sourceMappingURL=RestfulChatRoomService.js.map