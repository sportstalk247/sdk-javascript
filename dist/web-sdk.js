(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
exports.ChatClient = void 0;
var ChatModels_1 = require("../models/ChatModels");
var api_1 = require("./constants/api");
var errors_1 = require("./errors");
var RestfulChatEventService_1 = require("./REST/chat/RestfulChatEventService");
var RestfulChatRoomService_1 = require("./REST/chat/RestfulChatRoomService");
var RestfulUserService_1 = require("./REST/users/RestfulUserService");
var messages_1 = require("./constants/messages");
var utils_1 = require("./utils");
var RestfulNotificationService_1 = require("./REST/notifications/RestfulNotificationService");
var RestfulChatModerationService_1 = require("./REST/chat/RestfulChatModerationService");
var Moderation_1 = require("../models/Moderation");
/**
 * ChatClient provides an interface to chat applications.
 * The ChatClient is the primary class you will want to use if you are creating a chat application.
 * Common chat operations are abstracted through this class.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
var ChatClient = /** @class */ (function () {
    /**
     * Creates a chat client and detects the current domain.
     * @private
     */
    function ChatClient() {
        var _this = this;
        /**
         * Holds the configuration for the ChatClient and Backing services.
         * @private
         */
        this._config = { appId: "" };
        /**
         * Holds the current user for the client.
         * @private
         */
        this._user = { userid: "", handle: "" };
        this._lastCommand = null;
        this._lastCommandTime = 0;
        this._lastCommandTimeoutDuration = 3000;
        /**
         * Debugging method to grab the internal state and help debug.
         */
        this._getDebug = function () {
            return JSON.stringify(_this);
        };
        this.setUserTokenRefreshFunction = function (userTokenRefreshFunction) {
            if (_this._callBackDelegate) {
                _this._callBackDelegate.setCallback(userTokenRefreshFunction);
            }
            else {
                _this._callBackDelegate = new utils_1.CallBackDelegate(_this, userTokenRefreshFunction);
            }
            _this._config.userTokenRefreshFunction = _this._callBackDelegate.callback;
            _this.setConfig(_this._config);
        };
        this.setUserToken = function (userToken) {
            _this._config.userToken = userToken;
            _this.setConfig(_this._config);
        };
        this.getUserToken = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._config.userToken || ''];
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
         * Sets the config and creates (if needed) the internal services used to power the Chat.
         * @param config
         */
        this.setConfig = function (config) {
            var finalConfig = Object.assign({}, api_1.DEFAULT_CONFIG, config);
            _this._config = finalConfig;
            if (_this._config.userTokenRefreshFunction) {
                if (!_this._callBackDelegate) {
                    _this._callBackDelegate = new utils_1.CallBackDelegate(_this, _this._config.userTokenRefreshFunction);
                }
                else {
                    if (_this._config.userTokenRefreshFunction != _this._config.userTokenRefreshFunction) {
                        _this._callBackDelegate.setCallback(_this._config.userTokenRefreshFunction);
                    }
                }
                _this._config.userTokenRefreshFunction = _this._callBackDelegate.callback;
            }
            if (_this._eventService) {
                _this._eventService.setConfig(_this._config);
            }
            if (_this._roomService) {
                _this._roomService.setConfig(_this._config);
            }
            if (_this._userService) {
                _this._userService.setConfig(_this._config);
            }
            if (_this._notificationServce) {
                _this._notificationServce.setConfig(_this._config);
            }
            if (_this._moderationService) {
                _this._moderationService.setConfig(_this._config);
            }
            _this._eventService = _this._eventService || new RestfulChatEventService_1.RestfulChatEventService(_this._config);
            _this._roomService = _this._roomService || new RestfulChatRoomService_1.RestfulChatRoomService(_this._config);
            _this._userService = _this._userService || new RestfulUserService_1.RestfulUserService(_this._config);
            _this._notificationServce = _this._notificationServce || new RestfulNotificationService_1.RestfulNotificationService(_this._config);
            _this._moderationService = _this._moderationService || new RestfulChatModerationService_1.RestfulChatModerationService(_this._config);
            if (_this._config.user) {
                Object.assign(_this._user, _this._config.user);
            }
        };
        /**
         * Gets the current config.
         */
        this.getConfig = function () {
            return _this._config;
        };
        /**
         * Returns a specific event for the room
         * @param id
         * @param roomid OPTIONAL.  The room id for the room holding the event. Defaults to the current room. If no value passed and no room set, the method will throw an error.
         */
        this.getEventById = function (id, roomid) {
            return _this._roomService.getEventById(id, roomid || _this._currentRoom.id);
        };
        /**
         * Sets the default goal image
         * @param url a full URL, e.g. https://yourserver.com/some/image/url.png
         * @return string The url that was set for the goal image.
         */
        this.setDefaultGoalImage = function (url) {
            _this._defaultGoalImage = url;
            return _this._defaultGoalImage;
        };
        /**
         * Set the event handlers to receive chat events
         * @param eventHandlers
         */
        this.setEventHandlers = function (eventHandlers) {
            _this._eventService.setEventHandlers(eventHandlers);
        };
        /**
         * Gets the event handlers
         * @return eventsHandlerconfig The configuration object for event handler functions.
         */
        this.getEventHandlers = function () {
            return _this._eventService.getEventHandlers();
        };
        /**
         * @return IChatEventService The backing event service.
         */
        this.getEventService = function () {
            return _this._eventService;
        };
        /**
         * Get the current room service.
         * @return IChatRoomService
         */
        this.getRoomService = function () {
            return _this._roomService;
        };
        /**
         * Start the "talk".  This will being retrieving events from sportstalk servers.
         * If you pass a room parameter, will join the room and then start listening to updates.
         */
        this.startListeningToEventUpdates = function (room) {
            if (room) {
                return _this.joinRoom(room).then(function () { return _this.startListeningToEventUpdates(); });
            }
            _this._eventService.startEventUpdates();
        };
        /**
         * Stop the talk.  No new events will be retrieved.  However, if there are events still in a queue that queue may continue until empty.
         */
        this.stopListeningToEventUpdates = function () {
            _this._eventService.stopEventUpdates();
        };
        /**
         * Retrieve available rooms for this chat app.
         */
        this.listRooms = function (cursor, limit) {
            return _this._roomService.listRooms(cursor, limit);
        };
        /**
         * List all participants in a room.  Must have joined a room first.
         * @param cursor The cursor, used if you need to scroll through all users and there are over <maxresults> in the room.
         * @param maxresults The maximum number of results, defaults to 200.
         */
        this.listParticipants = function (cursor, maxresults) {
            if (maxresults === void 0) { maxresults = 200; }
            if (!_this._currentRoom) {
                throw new errors_1.SettingsError(messages_1.MISSING_ROOM);
            }
            return _this._roomService.listParticipants(_this._currentRoom, cursor, maxresults);
        };
        /**
         * Lists chatroom subscriptions for a user.
         * @param user
         * @param cursor
         */
        this.listUserSubscribedRooms = function (user, cursor) {
            return _this._userService.listUserSubscribedRooms(user, cursor);
        };
        /**
         * Set the chat user.
         * @param user
         */
        this.setUser = function (user) {
            _this._user = user;
            _this._eventService.setUser(_this._user);
            return _this;
        };
        /**
         * Get the current user.
         */
        this.getCurrentUser = function (user) {
            return _this._user;
        };
        /**
         * If the user exists, updates the user. Otherwise creates a new user.
         * @param user a User model.  The values of 'banned', 'handlelowercase' and 'kind' are ignored.
         */
        this.createOrUpdateUser = function (user, setDefault) {
            if (setDefault === void 0) { setDefault = true; }
            return _this._userService.createOrUpdateUser(user).then(function (user) {
                if (setDefault) {
                    _this._user = user;
                }
                return user;
            });
        };
        /**
         * Get the latest events from the server.  You probably want to use 'startTalk' instead.
         * This method will poll the server a single time for latest events.
         */
        this.getUpdates = function () {
            return _this._eventService.getUpdates();
        };
        /**
         * Join a chat room
         * @param room
         */
        this.joinRoom = function (room, ignoreInitialMessages) {
            if (ignoreInitialMessages === void 0) { ignoreInitialMessages = false; }
            return _this._roomService.joinRoom(room, _this._user).then(function (response) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this._currentRoom = response.room;
                            this._eventService.setCurrentRoom(this._currentRoom);
                            this._eventService.setPreviousEventsCursor(response.previouseventscursor || '');
                            response.eventscursor.events.reverse();
                            if (!!ignoreInitialMessages) return [3 /*break*/, 2];
                            return [4 /*yield*/, this._eventService.handleUpdates(response.eventscursor)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [2 /*return*/, response];
                    }
                });
            }); });
        };
        /**
         * Exit a room.
         */
        this.exitRoom = function () {
            if (!_this._eventService.getCurrentRoom()) {
                throw new errors_1.SettingsError("Cannot exit if not in a room!");
            }
            return _this._roomService.exitRoom(_this._user, _this._currentRoom).then(function (response) {
                return response;
            });
        };
        /**
         * Removes all user messages from a room.
         * @param user Optional.  A user whose messages to purge from room.
         * @param room Optional.  The room to purge messages from. Defaults to current room, if set.  Otherwise throws an error.
         */
        this.purgeUserMessagesFromRoom = function (user, room) {
            var theUser = user || _this._user;
            var theRoom = room || _this._currentRoom;
            if (!theRoom) {
                throw new errors_1.SettingsError("Requires setting a room to issue purge");
            }
            return _this._roomService.purgeUserMessagesFromRoom(theRoom, theUser);
        };
        /**
         * Gets currently set room.  Returns the current room or undefined if a room has not been joined.
         */
        this.getCurrentRoom = function () {
            return _this._eventService.getCurrentRoom();
        };
        /**
         * Set the current room state.
         * @param room
         */
        this.setCurrentRoom = function (room) {
            _this._currentRoom = room;
            _this._eventService.setCurrentRoom(room);
        };
        this.getRoomDetails = function (room) {
            return _this._roomService.getRoomDetails(room);
        };
        /**
         * Returns the ChatRoomResult for a given id.
         * @param room
         */
        this.getRoomDetailsByCustomId = function (room) {
            return _this._roomService.getRoomDetailsByCustomId(room);
        };
        /**
         * Checks if a user is bounced from a room.  If forceRefresh is true, will always ask the server for fresh data.
         * Will also check the server if the current room is just an ID and not a full ChatRoomResult object.
         * @param user
         * @param forceRefresh will force a server update of the room before checking status.
         * @param room optional room, will use current room if not set.
         */
        this.isUserBouncedFromRoom = function (user, forceRefresh, room) { return __awaiter(_this, void 0, void 0, function () {
            var chatroom, userid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        chatroom = room || this._currentRoom || null;
                        if (!chatroom) {
                            throw new Error("Invalid room, make sure the room has a valid ID");
                        }
                        // @ts-ignore
                        if (user) {
                            // @ts-ignore
                            userid = user.userid || user;
                        }
                        else {
                            throw new Error("Must provide a user or userid");
                        }
                        if (!(forceRefresh || !chatroom.id)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getRoomDetails(chatroom)];
                    case 1:
                        chatroom = _a.sent();
                        if (chatroom && this._currentRoom && this._currentRoom.id) {
                            if (chatroom.id === this._currentRoom.id) {
                                this._currentRoom = chatroom;
                            }
                        }
                        _a.label = 2;
                    case 2:
                        // @ts-ignore
                        if (!chatroom || !chatroom.bouncedusers || chatroom.bouncedusers.length === 0) {
                            return [2 /*return*/, false];
                        }
                        // @ts-ignore
                        if (chatroom && chatroom.bouncedusers && chatroom.bouncedusers.includes(userid)) {
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                }
            });
        }); };
        this.getUserService = function () {
            return _this._userService;
        };
        this.getUserEffects = function (user, forceRefresh, room) { return __awaiter(_this, void 0, void 0, function () {
            var chatroom, finalUser, userid;
            return __generator(this, function (_a) {
                chatroom = room || this._currentRoom || null;
                finalUser = user || this._user;
                if (!chatroom) {
                    throw new Error("Need to specify or join a chat room to check user effects");
                }
                if (!finalUser) {
                    throw new Error("Need to specify a user or set current user to get effects");
                }
                userid = utils_1.forceObjKeyOrString(finalUser, 'userid');
                return [2 /*return*/, this._moderationService.listRoomEffects(chatroom).then(function (results) {
                        var _a;
                        var activeEffects = {
                            mute: false,
                            shadowban: false,
                            flag: false
                        };
                        (_a = results === null || results === void 0 ? void 0 : results.effects) === null || _a === void 0 ? void 0 : _a.map(function (effect) {
                            if (effect.user.userid == userid) {
                                if (effect.effect.effecttype === 'flag') {
                                    activeEffects.flag = true;
                                    return;
                                }
                                if (effect.effect.effecttype === 'mute') {
                                    activeEffects.mute = true;
                                    return;
                                }
                                if (effect.effect.effecttype === 'shadowban') {
                                    activeEffects.shadowban = true;
                                    return;
                                }
                            }
                        });
                        return activeEffects;
                    })];
            });
        }); };
        /**
         * Checks if a user is bounced from a room.  If forceRefresh is true, will always ask the server for fresh data.
         * Will also check the server if the current room is just an ID and not a full ChatRoomResult object.
         * @param user
         * @param forceRefresh will force a server update of the room before checking status
         * @param room optional room, will use current room if not set.
         */
        this.isUserShadowbanned = function (user, forceRefresh, room) { return __awaiter(_this, void 0, void 0, function () {
            var chatroom, userid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        chatroom = room || this._currentRoom || null;
                        if (!chatroom) {
                            throw new Error("Invalid room, make sure the room has a valid ID");
                        }
                        // @ts-ignore
                        if (user) {
                            // @ts-ignore
                            userid = user.userid || user;
                        }
                        else {
                            throw new Error("Must provide a user or userid");
                        }
                        if (!(forceRefresh || !chatroom.id)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getRoomDetails(chatroom)];
                    case 1:
                        chatroom = _a.sent();
                        if (chatroom && this._currentRoom && this._currentRoom.id) {
                            if (chatroom.id === this._currentRoom.id) {
                                this._currentRoom = chatroom;
                            }
                        }
                        _a.label = 2;
                    case 2:
                        // @ts-ignore
                        if (!chatroom || !chatroom.shadowbannedusers || chatroom.shadowbannedusers.length === 0) {
                            return [2 /*return*/, false];
                        }
                        // @ts-ignore
                        if (chatroom && chatroom.shadowbannedusers && chatroom.shadowbannedusers.includes(userid)) {
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                }
            });
        }); };
        /**
         * ROOM COMMANDS SECTION
         */
        /**
         * Send a chat command.  Usually only the first param is needed.
         * @param command the chat string, which can also include admin or action commands by starting with `/` or `*`
         * @param options the custom parameters.  See CommandOptions interface for details.
         */
        this.executeChatCommand = function (command, options) {
            _this._throttle(command);
            return _this._eventService.executeChatCommand(_this._user, command, options);
        };
        /**
         * Sends an announcement, forces the announcement eventType.  Convenience method around executeChatCommand.
         * @param command
         * @param options
         */
        this.sendAnnouncement = function (command, options) {
            _this._throttle(command);
            return _this._eventService.executeChatCommand(_this._user, command, Object.assign(options || {}, { eventtype: ChatModels_1.ChatOptionsEventType.announcement }));
        };
        /**
         * Reply to an event
         * @param message the text that will make up the reply
         * @param replyto the Event that is being replied to or the event ID as a string
         * @param options custom options, will depend on your chat implementation
         */
        this.sendQuotedReply = function (message, replyto, options) {
            _this._throttle(message);
            return _this._eventService.sendQuotedReply(_this._user, message, replyto, options);
        };
        /**
         * Reply to an event
         * @param message the text that will make up the reply
         * @param replyto the Event that is being replied to or the event ID as a string
         * @param options custom options, will depend on your chat implementation
         */
        this.sendThreadedReply = function (message, replyto, options) {
            _this._throttle(message);
            return _this._eventService.sendThreadedReply(_this._user, message, replyto, options);
        };
        /**
         * React to an event
         * @param reaction
         * @param reactToMessage
         * @param options
         */
        this.reactToEvent = function (reaction, reactToMessage, options) {
            return _this._eventService.reactToEvent(_this._user, reaction, reactToMessage, options);
        };
        /**
         * Send an advertisement custom event
         * @param options
         */
        this.sendAdvertisement = function (options) {
            return _this._eventService.sendAdvertisement(_this._user, options);
        };
        /**
         * Send a goal event.
         * This is a convenience wrapper around custom messagings, if a default image is set, no further parameters are needed.
         *
         * @param message The message to be sent with the goal.  Defaults to GOAL!!!
         * @param img The full url of the image to send as part of the goal, e.g. https://....
         * @param options other custom options to send.
         */
        this.sendGoal = function (message, img, options) {
            return _this._eventService.sendGoal(_this._user, img || _this._defaultGoalImage || '', message, options);
        };
        /**
         * Flags an event as deleted
         * @param event the event to be deleted.
         * @return the result of the API call.
         */
        this.flagEventLogicallyDeleted = function (event, permamentifnoreplies) {
            if (permamentifnoreplies === void 0) { permamentifnoreplies = true; }
            return _this._eventService.flagEventLogicallyDeleted(_this._user, event, permamentifnoreplies);
        };
        /**
         * Permanently deletes an event.
         * @param event the event to be deleted.
         * @return the result of the API call.
         */
        this.permanetlyDeleteEvent = function (event) {
            return _this._eventService.permanetlyDeleteEvent(_this._user, event);
        };
        /**
         * Report a chat event for violating community policy.
         * @param event
         * @param type
         */
        this.reportMessage = function (event, type) {
            var reason = {
                reporttype: type,
                userid: _this._user.userid
            };
            return _this._eventService.reportMessage(event, reason);
        };
        /**
         * Create a new chatroom
         * @param room the Room object describing the room
         * @return the Room created on the server, with a roomID.
         */
        this.createRoom = function (room) {
            return _this._roomService.createRoom(room);
        };
        /**
         * Update a room that's been created.
         * @param room An already created room with a roomId.
         * @return the updated room information.
         */
        this.updateRoom = function (room) {
            return _this._roomService.updateRoom(room);
        };
        this.deleteRoom = function (room) {
            return _this._roomService.deleteRoom(room);
        };
        this.setBanStatus = function (user, isBanned) {
            return _this._userService.setBanStatus(user, isBanned);
        };
        /**
         * Adds or removes the shadowban status on the user.
         * This method is global.  If a room is specified in options it will be ignored.
         * @param user
         * @param options
         */
        this.setShadowBanStatus = function (user, options) {
            if (options && options.roomid) {
                return _this._roomService.setRoomShadowbanStatus(user, options.roomid || _this._currentRoom, options.applyeffect, options.expireseconds);
            }
            return _this._userService.setShadowBanStatus(user, options.applyeffect, options.expireseconds);
        };
        this.shadowBanUserFromRoom = function (user, expireseconds, roomid) {
            return _this._roomService.setRoomShadowbanStatus(user, roomid || _this._currentRoom, true, expireseconds);
        };
        this.unShadowBanUserFromRoom = function (user, expireseconds, roomid) {
            return _this._roomService.setRoomShadowbanStatus(user, roomid || _this._currentRoom, false, expireseconds);
        };
        this.muteUserInRoom = function (user, mute, expireseconds, room) {
            var targetRoom = room || _this._currentRoom;
            return _this._roomService.setRoomMuteStatus(user, targetRoom, mute, expireseconds);
        };
        this.searchUsers = function (search, type, limit) {
            return _this._userService.searchUsers(search, type, limit);
        };
        this.listUsers = function (request) {
            return _this._userService.listUsers(request);
        };
        this.listEventsByType = function (type) {
            return _this._eventService.listEventsByType(type);
        };
        /**
         * Requests user notifications.
         * Max limit is 100. Requests over this limit will return a maximum of 100 notifications.
         * Calling the API without any parameters will request 50 notifications for the current user.
         * if no user is set, will throw an error.
         * @param request {userid?:string, limit?:number, includeread?:boolean, cursor?: string}
         */
        this.listUserNotifications = function (request) {
            if (request === void 0) { request = {}; }
            var requestedNotifications = Object.assign({
                limit: 50,
                userid: _this._user ? _this._user.userid : '',
                includeread: false,
            }, request);
            return _this._notificationServce.listUserNotifications(requestedNotifications);
        };
        this.markAllNotificationsAsRead = function (user, deleteAll) {
            if (deleteAll === void 0) { deleteAll = true; }
            var targetuser = user || _this._user;
            return _this._notificationServce.markAllNotificationsAsRead(targetuser, deleteAll);
        };
        this.setNotificationReadStatus = function (notificationid, read, userid) {
            var finaluserid = userid || _this._user ? _this._user.userid : '';
            return _this._notificationServce.setNotificationReadStatus(notificationid, finaluserid, read);
        };
        this.deleteNotification = function (notificationid, userid) { return __awaiter(_this, void 0, void 0, function () {
            var finaluserid;
            return __generator(this, function (_a) {
                finaluserid = userid || this._user ? this._user.userid : '';
                return [2 /*return*/, this._notificationServce.deleteNotification(notificationid, finaluserid)];
            });
        }); };
        this.deleteNotificationByChatEventId = function (chateventid, userid) {
            var finaluserid = userid || _this._user ? _this._user.userid : '';
            return _this._notificationServce.deleteNotificationByChatEventId(chateventid, finaluserid);
        };
        this.deleteUser = function (user) {
            return _this._userService.deleteUser(user);
        };
        this.getUserDetails = function (user) {
            return _this._userService.getUserDetails(user);
        };
        /**
         * Checks if the current user has already reported a message.
         * If no current user set or provided, throws an error;
         * @param event the event to check.  Will evaluate if the given user or default user has reported it.
         * @param user optional. A user to check for reporting.
         * @return boolean true if reported by the given user.
         */
        this.messageIsReported = function (event, user) {
            var checkUser = user || _this._user;
            var id = utils_1.forceObjKeyOrString(checkUser, 'userid');
            if (id) {
                return false;
            }
            if (event && event.reports && event.reports.length) {
                var isReported = event.reports.find(function (report) { return report.userid == id; });
                return !!isReported;
            }
            return false;
        };
        this.getRoomExtendedDetails = function (request) {
            return _this._roomService.getRoomExtendedDetails(request);
        };
        /**
         * Checks if a message was reacted to by the current user.
         * @param event The event to evaluate.
         * @param reaction true or false.  Returns false if no user set.
         */
        this.messageIsReactedTo = function (event, reaction) {
            if (!_this._user || !_this._user.userid) {
                return false;
            }
            if (event && event.reactions && event.reactions.length) {
                var found = event.reactions.find(function (report) { return report.type === reaction; });
                if (found !== undefined) {
                    var ourUser = found.users.find(function (user) { return user.userid === _this._user.userid; });
                    return !!ourUser;
                }
            }
            return false;
        };
        /**
         * Lists events older than a given cursor.  Will default to the last known cursor if updates have been triggered.
         * @param cursor
         * @param limit
         */
        this.listPreviousEvents = function (cursor, limit) {
            if (limit === void 0) { limit = 100; }
            return _this._eventService.listPreviousEvents(cursor, limit);
        };
        /**
         * Bounces a user from a room, removing from room and banning them.
         *
         * @param user a UserResult (with id) or a string representing the userid
         * @param message the bounce reason.
         * @return BounceUserResult the result of the command from the server.
         */
        this.bounceUser = function (user, message) { return __awaiter(_this, void 0, void 0, function () {
            var bounce;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._roomService.bounceUserFromRoom(this._currentRoom, user, message)];
                    case 1:
                        bounce = _a.sent();
                        return [2 /*return*/, bounce.data];
                }
            });
        }); };
        /**
         * Removes a user from the bounce list if they were bounced before. Allows them to rejoin chat.
         *
         * @param user a UserResult (with id) or a string representing the userid
         * @param message the bounce reason.
         * @return BounceUserResult the result of the command from the server.
         */
        this.unbounceUser = function (user, message) { return __awaiter(_this, void 0, void 0, function () {
            var bounce;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._roomService.unbounceUserFromRoom(this._currentRoom, user, message)];
                    case 1:
                        bounce = _a.sent();
                        return [2 /*return*/, bounce.data];
                }
            });
        }); };
        /**
         * Manually set the cursor used to grab new updates.
         * You may want to use this and setPreviousEventsCursor if you are scrolling through a large number of messages
         * and wish to limit the number of events somehow to improve UI responsiveness.
         * @param cursor
         */
        this.setUpdatesCursor = function (cursor) {
            _this._eventService.setUpdatesCursor(cursor);
        };
        /**
         * Manually set the cursor holding the oldest event known, for scrollback.
         * You may need to use this if you scroll back a lot
         * @param cursor
         */
        this.setPreviousEventsCursor = function (cursor) {
            _this._eventService.setPreviousEventsCursor(cursor);
        };
        /**
         * Reports a user.
         * @param userToReport the user who is causing problems
         * @param reportedBy The user who is reporting the bad behavior.
         * @param reportType The type of report, either 'abuse' or 'spam'
         * @param room if specified, will not report the user globally but only in the current room.
         */
        this.reportUser = function (userToReport, reportedBy, reportType) {
            if (reportType === void 0) { reportType = Moderation_1.ReportType.abuse; }
            return _this._userService.reportUser(userToReport, reportedBy, reportType);
        };
        this.reportUserInRoom = function (userToReport, reportedBy, reportType, room) {
            if (reportType === void 0) { reportType = Moderation_1.ReportType.abuse; }
            return _this._roomService.reportUser(userToReport, reportedBy, reportType, room);
        };
        this.updateChatEvent = function (event, body, user) {
            return _this._eventService.updateChatEvent(event, body, user);
        };
        this.listEventsByTimestamp = function (query) {
            return _this._eventService.listEventsByTimestamp(query);
        };
    }
    ChatClient.prototype._throttle = function (command) {
        if (command == this._lastCommand && (new Date().getTime() - this._lastCommandTime) < this._lastCommandTimeoutDuration) {
            var throttleError = new Error(messages_1.THROTTLE_ERROR);
            // @ts-ignore
            throttleError.code = 405;
            throw throttleError;
        }
        else {
            this._lastCommandTime = new Date().getTime();
            this._lastCommand = command;
        }
    };
    ChatClient.prototype.getTokenExp = function () {
        return 0;
    };
    /**
     * Join a room by it's customid
     * @param user
     * @param room
     */
    ChatClient.prototype.joinRoomByCustomId = function (room, ignoreInitialMessages) {
        var _this = this;
        if (ignoreInitialMessages === void 0) { ignoreInitialMessages = false; }
        return this._roomService.joinRoomByCustomId(room, this._user).then(function (response) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._currentRoom = response.room;
                        this._eventService.setCurrentRoom(this._currentRoom);
                        this._eventService.setPreviousEventsCursor(response.previouseventscursor || '');
                        if (!!ignoreInitialMessages) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._eventService.handleUpdates(response.eventscursor)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, response];
                }
            });
        }); });
    };
    ChatClient.prototype.setNotificationReadStatusByChatEventId = function (chateventid, read, userid) {
        var finaluserid = userid || this._user ? this._user.userid : '';
        return this._notificationServce.setNotificationReadStatusByChatEventId(chateventid, finaluserid, read);
    };
    /**
     * Configures and creates a ChatClient
     * @param config
     * @param eventHandlers
     * @return SportsTalkClient.  Currently only a REST based client is supported.  Future SDK versions will implement other options such as firebase messaging and websockets
     */
    ChatClient.init = function (config, eventHandlers) {
        if (config === void 0) { config = { appId: "" }; }
        var client = new ChatClient();
        client.setConfig(config);
        if (eventHandlers) {
            client.setEventHandlers(eventHandlers);
        }
        return client;
    };
    return ChatClient;
}());
exports.ChatClient = ChatClient;

},{"../models/ChatModels":16,"../models/Moderation":19,"./REST/chat/RestfulChatEventService":3,"./REST/chat/RestfulChatModerationService":4,"./REST/chat/RestfulChatRoomService":5,"./REST/notifications/RestfulNotificationService":9,"./REST/users/RestfulUserService":10,"./constants/api":11,"./constants/messages":12,"./errors":13,"./utils":15}],2:[function(require,module,exports){
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
exports.CommentClient = void 0;
var RestfulCommentService_1 = require("./REST/comments/RestfulCommentService");
var RestfulConversationService_1 = require("./REST/comments/RestfulConversationService");
var api_1 = require("./constants/api");
var RestfulUserService_1 = require("./REST/users/RestfulUserService");
var utils_1 = require("./utils");
/**
 * This is the API client for the Conversations feature.
 * For most implementations, this is the main class you will be using.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
var CommentClient = /** @class */ (function () {
    function CommentClient() {
        var _this = this;
        /**
         * Default settings for comment requests.
         * @private
         */
        this._defaultCommentRequest = {
            includechildren: false
        };
        /**
         * Get the current configuration object
         * @return SportsTalkConfig
         */
        this.getConfig = function () {
            return _this._config;
        };
        /**
         * Gets the user's access token. If unset returns an empty string.
         */
        this.getUserToken = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._config.userToken || ''];
            });
        }); };
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
        this.setUserTokenRefreshFunction = function (userTokenRefreshFunction) {
            if (_this._callbackDelegate) {
                _this._callbackDelegate.setCallback(userTokenRefreshFunction);
            }
            else {
                _this._callbackDelegate = new utils_1.CallBackDelegate(_this, userTokenRefreshFunction);
            }
            _this._config.userTokenRefreshFunction = _this._callbackDelegate.callback;
            _this.setConfig(_this._config);
        };
        /**
         * Refreshes the user's access token.  You MUST have already set a user access token AND registered a refresh function.
         * If the refresh function fails to refresh the token, there is no token, or there is an error, this will not refresh the token and throws an error.
         */
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
         * Set the current user for commands
         * @param user
         */
        this.setUser = function (user, userToken) {
            _this._user = user;
            if (userToken) {
                _this._config.userToken = userToken;
                _this.setConfig(_this._config);
            }
        };
        /**
         * Get the current user.
         */
        this.getCurrentUser = function () {
            return _this._user;
        };
        /**
         * Set configuration.
         * @param config
         * @param commentService optional, for future extension by custom implementation.
         * @param conversationService optional, for future extension by custom implementation.
         */
        this.setConfig = function (config, commentService, conversationService) {
            _this._config = Object.assign({}, api_1.DEFAULT_CONFIG, config);
            if (!_this._commentService || commentService) {
                _this._commentService = commentService || new RestfulCommentService_1.RestfulCommentService();
            }
            if (!_this._conversationService || conversationService) {
                _this._conversationService = conversationService || new RestfulConversationService_1.RestfulConversationService();
            }
            if (!_this._userService) {
                _this._userService = new RestfulUserService_1.RestfulUserService(_this._config);
            }
            _this._conversationService.setConfig(_this._config);
            _this._commentService.setConfig(_this._config);
            if (config.user) {
                _this._user = config.user;
            }
        };
        /**
         * Create a new comments.
         * @param conversation the comments to create
         * @param setDefault if set to true (default) will set this comments as the current comments used by other API calls.
         */
        this.createConversation = function (conversation, setDefault) {
            if (setDefault === void 0) { setDefault = true; }
            return __awaiter(_this, void 0, void 0, function () {
                var created;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._conversationService.createConversation(conversation)];
                        case 1:
                            created = _a.sent();
                            if (setDefault) {
                                this._currentConversation = created;
                            }
                            return [2 /*return*/, created];
                    }
                });
            });
        };
        /**
         * Returns a conversation if it already exists, otherwise creates it and sets it as default.
         * Does NOT update a conversation's settings if it already exists.  Settings should be primarily managed from the dashboard.
         * @param conversation
         */
        this.ensureConversation = function (conversation) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getConversation(conversation)
                        .then(function (conversation) {
                        _this.setCurrentConversation(conversation);
                        return conversation;
                    })
                        .catch(function (error) {
                        return _this.createConversation(conversation, true);
                    })];
            });
        }); };
        /**
         * Get the default comments
         * @param conversation
         */
        this.setCurrentConversation = function (conversation) {
            _this._currentConversation = conversation;
            return _this._currentConversation;
        };
        /**
         * Returns the current default comments
         * @return conversation a Conversation object, a string for the conversationID, or null.
         */
        this.getCurrentConversation = function () {
            return _this._currentConversation;
        };
        /**
         * Retrieves a comments from the server
         * @param conversation
         */
        this.getConversation = function (conversation) {
            return _this._conversationService.getConversation(conversation);
        };
        this.reactToConversationTopic = function (conversation, reaction, user) {
            if (reaction === void 0) { reaction = { reaction: 'like', reacted: true }; }
            return _this._conversationService.reactToConversationTopic(conversation, reaction || {}, user || _this._user);
        };
        /**
         * Deletes a comments. Be careful. Cannot be reversed
         * @param conversation
         */
        this.deleteConversation = function (conversation) {
            return _this._conversationService.deleteConversation(conversation);
        };
        /**
         *
         * @param comment The comment string or Comment object
         * @param replyto either the comment object to reply to or the ID as a string
         */
        this.publishComment = function (comment, replyto) {
            var conversationid = utils_1.forceObjKeyOrString(_this._currentConversation, 'conversationid');
            return _this._commentService.publishComment(conversationid, comment, _this._user, replyto);
        };
        /**
         * Retrieves a specific comment
         * @param comment
         */
        this.getComment = function (comment) {
            var conversationid = utils_1.forceObjKeyOrString(_this._currentConversation, 'conversationid');
            return _this._commentService.getComment(conversationid, comment);
        };
        /**
         * If the user exists, updates the user. Otherwise creates a new user.
         * @param user a User model.  The values of 'banned', 'handlelowercase' and 'kind' are ignored.
         */
        this.createOrUpdateUser = function (user, setDefault) {
            if (setDefault === void 0) { setDefault = true; }
            return _this._userService.createOrUpdateUser(user).then(function (user) {
                if (setDefault) {
                    _this._user = user;
                }
                return user;
            });
        };
        /**
         * Deletes a comment
         * @param comment
         * @param final
         */
        this.deleteComment = function (comment, final) {
            var conversationid = utils_1.forceObjKeyOrString(_this._currentConversation, 'conversationid');
            return _this._commentService.deleteComment(conversationid, comment, _this._user, final);
        };
        /**
         * Update a comment that already exists
         * @param comment
         */
        this.updateComment = function (comment) {
            // @ts-ignore
            var conversationid = utils_1.forceObjKeyOrString(_this._currentConversation, 'conversationid');
            return _this._commentService.updateComment(conversationid, comment, _this._user);
        };
        /**
         * Issues a comment reaction.
         * @param comment
         * @param reaction
         */
        this.reactToComment = function (comment, reaction) {
            var conversationid = utils_1.forceObjKeyOrString(_this._currentConversation, 'conversationid');
            return _this._commentService.react(conversationid, comment, _this._user, reaction);
        };
        /**
         * Votes on a comment
         * @param comment
         * @param vote
         */
        this.voteOnComment = function (comment, vote) {
            var conversationid = utils_1.forceObjKeyOrString(_this._currentConversation, 'conversationid');
            return _this._commentService.vote(conversationid, comment, _this._user, vote);
        };
        /**
         * Report a comment for violating the rules
         * @param comment
         * @param reportType
         */
        this.reportComment = function (comment, reportType) {
            var conversationid = utils_1.forceObjKeyOrString(_this._currentConversation, 'conversationid');
            return _this._commentService.report(conversationid, comment, _this._user, reportType);
        };
        /**
         * Get replies to a specific comment
         * @param comment
         * @param request
         */
        this.getCommentReplies = function (comment, request) {
            var conversationid = utils_1.forceObjKeyOrString(_this._currentConversation, 'conversationid');
            var commentid = utils_1.forceObjKeyOrString(comment);
            return _this._commentService.getReplies(conversationid, commentid, request);
        };
        this.listRepliesBatch = function (parentids, limit) {
            if (limit === void 0) { limit = 50; }
            var conversationid = utils_1.forceObjKeyOrString(_this._currentConversation, 'conversationid');
            return _this._commentService.listRepliesBatch(conversationid, parentids, limit);
        };
        /**
         * Retrieves comments
         * @param request how to sort/filter the comments.  See CommentRequest
         * @param conversation optional, if removed will retrieve the comments for the comments set with `setConversation()`
         */
        this.listComments = function (request, conversation) {
            var conversationid = utils_1.forceObjKeyOrString(conversation || _this._currentConversation, 'conversationid');
            var finalRequest = Object.assign({}, _this._defaultCommentRequest, request);
            // @ts-ignore
            return _this._commentService.listComments(conversationid, finalRequest);
        };
        /**
         * List available conversations
         * @param filter a conversationrequest, currently allows you to filter only by property.
         */
        this.listConversations = function (filter) {
            return _this._conversationService.listConversations(filter);
        };
        this.setBanStatus = function (user, isBanned) {
            return _this._userService.setBanStatus(user, isBanned);
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
        this.getConversationBatchDetails = function (conversations, options) {
            //@ts-ignore
            return _this._conversationService.getConversationBatchDetails(conversations, options);
        };
    }
    /**
     * Creates a new Conversation Client
     * @param SportsTalkConfig
     * @param initialConversation Either a comments object or a comments id
     * @param commentService optional and here for future extension for custom implementations of the comment service.
     * @param conversationService optional and here for future extension for cusstom implementations of the comments service.
     */
    CommentClient.init = function (config, initialConversation, commentService, conversationService) {
        var commentClient = new CommentClient();
        // @ts-ignore
        commentClient.setConfig(config, commentService, conversationService);
        if (initialConversation) {
            commentClient.setCurrentConversation(initialConversation);
        }
        return commentClient;
    };
    CommentClient.prototype.getTokenExp = function () {
        return 0;
    };
    CommentClient.prototype.getConversationByCustomId = function (conversation) {
        return this._conversationService.getConversationByCustomId(conversation);
    };
    return CommentClient;
}());
exports.CommentClient = CommentClient;

},{"./REST/comments/RestfulCommentService":7,"./REST/comments/RestfulConversationService":8,"./REST/users/RestfulUserService":10,"./constants/api":11,"./utils":15}],3:[function(require,module,exports){
(function (process){(function (){
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
exports.RestfulChatEventService = void 0;
var ChatModels_1 = require("../../../models/ChatModels");
var api_1 = require("../../constants/api");
var utils_1 = require("../../utils");
var errors_1 = require("../../errors");
var messages_1 = require("../../constants/messages");
var network_1 = require("../../network");
var INVALID_POLL_FREQUENCY = "Invalid poll _pollFrequency.  Must be between 250ms and 5000ms";
/**
 * This class manages polling for chat events and routing those events to the appropriate callbacks.
 * You probably do not want this class, you want the ChatClient.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
var RestfulChatEventService = /** @class */ (function () {
    /**
     * @param config The SportsTalkConfig object
     * @param eventHandlers A set of event handlers that will deal with chat events received from polling.
     * @constructor
     */
    function RestfulChatEventService(config, eventHandlers) {
        var _this = this;
        if (eventHandlers === void 0) { eventHandlers = {}; }
        this._config = { appId: "" };
        this._apiHeaders = {}; // holds the API headers
        this._jsonHeaders = {};
        this._fetching = false; // used to prevent a queue of requests if network is down.
        this._eventHandlers = {}; // holds the event handler function references.
        // Holds a set of ignored userIDs.
        this._ignoreList = new Set();
        this.request = network_1.bindJWTUpdates(this);
        this._user = { userid: "", handle: "" }; // current user.
        this.lastCursor = undefined; //holds the cursor for the most recent message received in current room
        // for scrollback
        this.oldestCursor = undefined; // holds the oldest cursor known
        // Holds the size of the updates we we will request.
        this._maxEventsPerUpdateLimit = 100;
        // Holds the size of the event buffer we will accept before displaying everything in order to catch up.
        this._maxEventBufferSize = 30;
        this.NetworkRequest = network_1.bindJWTUpdates(this);
        /**
         * How often to poll for updates. can be set by ENV variable of SPORTSTALK_POLL_FREQUENCY on the server side.
         * Can also be set with setUpdateSpeed()
         * @private
         */
        this._pollFrequency = 800;
        /**
         * Only used if event smoothing is enabled.
         * Keeps a list of messages we already rendered so we can ignore them in getUpdates
         * @private
         */
        this._preRenderedMessages = new Set();
        /**
         * Only used if event smoothing is enabled;
         * @private
         */
        this._eventSpacingMs = 100;
        /**
         * Manually set the cursor used to grab new updates.
         * You may want to use this and setPreviousEventsCursor if you are scrolling through a large number of messages
         * and wish to limit the number of events somehow to improve UI responsiveness.
         * @param cursor
         */
        this.setUpdatesCursor = function (cursor) {
            _this.lastCursor = cursor || '';
        };
        /**
         * Manually set the cursor holding the oldest event known, for scrollback.
         * You may need to use this if you scroll back a lot
         * @param cursor
         */
        this.setPreviousEventsCursor = function (cursor) {
            _this.oldestCursor = cursor || '';
        };
        /**
         * Set event handler callbacks
         * @param eventHandlers
         */
        this.setEventHandlers = function (eventHandlers) {
            _this._eventHandlers = eventHandlers;
        };
        /**
         * Get current event handler callback functions
         */
        this.getEventHandlers = function () {
            return _this._eventHandlers || {};
        };
        /**
         * Set the user
         * @param user
         */
        this.setUser = function (user) {
            _this._config.user = Object.assign(_this._user, user);
            _this._user = _this._config.user;
        };
        this.getTokenExp = function () {
            return _this._tokenExp;
        };
        /**
         * Get the user
         * @return User
         */
        this.getCurrentUser = function () {
            return _this._user;
        };
        this.setUserToken = function (token) {
            _this._config.userToken = token;
            _this.setConfig(_this._config);
        };
        this.getUserToken = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._config.userToken || ""];
            });
        }); };
        this.setUserTokenRefreshFunction = function (refreshFunction) {
            _this._config.userTokenRefreshFunction = refreshFunction;
        };
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
         * Set the config
         * @param config
         */
        this.setConfig = function (config) {
            _this._config = Object.assign({}, api_1.DEFAULT_CONFIG, config);
            _this._user = Object.assign({}, _this._user, _this._config.user);
            _this._apiHeaders = utils_1.getUrlEncodedHeaders(_this._config.apiToken, _this._config.userToken);
            _this._jsonHeaders = utils_1.getJSONHeaders(_this._config.apiToken, _this._config.userToken);
            _this._smoothEventUpdates = !!(_this._config.smoothEventUpdates || _this._smoothEventUpdates);
            _this._maxEventBufferSize = _this._config.maxEventBufferSize || _this._maxEventBufferSize;
            try {
                var frequency = process.env.SPORTSTALK_POLL_FREQUENCY ? parseInt(process.env.SPORTSTALK_POLL_FREQUENCY) : 800;
                _this._pollFrequency = frequency;
            }
            catch (e) {
                console.log(e);
                _this._pollFrequency = config.chatEventPollFrequency || 800;
            }
            _this._eventSpacingMs = config.updateEmitFrequency || Math.floor(_this._pollFrequency / 100);
        };
        /**
         * Set event smoothing directly.
         * @param smoothing
         */
        this.setEventSmoothingMs = function (smoothing) {
            if (smoothing && typeof smoothing === "number") {
                _this._eventSpacingMs = smoothing;
            }
        };
        /**
         *
         * @param roomid
         * @param userid
         */
        this._startKeepAlive = function (roomid, userid) {
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, "chat/rooms/" + roomid + "/sessions/" + userid + "/touch"),
                headers: _this._jsonHeaders
            };
            _this._keepAliveFunction = function keepAliveFunction() {
                return network_1.stRequest(config);
            };
            _this._endKeepAlive();
            _this._keepAliveInterval = setInterval(_this._keepAliveFunction, 1000);
        };
        /**
         * Ends keepAlive.
         */
        this._endKeepAlive = function () {
            if (_this._keepAliveInterval) {
                clearInterval(_this._keepAliveInterval);
            }
        };
        /**
         * Get current room, if set.
         * @return ChatRoomResult
         */
        this.getCurrentRoom = function () {
            return _this._currentRoom;
        };
        /**
         * Set current room, reset chat polling if a new room.
         * Will trigger onRoomChange() if new and old rooms are different
         * @param room
         * @return ChatRoomResult or null
         */
        this.setCurrentRoom = function (room) {
            var oldRoom = _this._currentRoom;
            if (!room || !room.id) {
                throw new errors_1.SettingsError(messages_1.REQUIRE_ROOM_ID);
            }
            if (!_this._currentRoom || (_this._currentRoom.id !== room.id)) {
                _this.lastTimestamp = undefined;
                _this.lastCursor = undefined;
                _this.lastMessageId = undefined;
                _this.firstMessageId = undefined;
                _this.firstMessageTime = undefined;
                _this._currentRoom = room;
                if (_this._eventHandlers.onRoomChange) {
                    _this._eventHandlers.onRoomChange(_this._currentRoom, oldRoom);
                }
                if (_this._currentRoom) {
                    _this._roomApi = utils_1.buildAPI(_this._config, "chat/rooms/" + _this._currentRoom.id);
                }
                else {
                    _this._roomApi = null;
                }
                _this._commandApi = _this._roomApi + "/command";
                _this._updatesApi = _this._roomApi + "/updates";
            }
            else {
                _this._currentRoom = room;
            }
            return room;
        };
        /**
         * Set how often we poll for events, defaults to 800ms
         * @param frequency poll frequency in milliseconds
         */
        this.setUpdateSpeed = function (frequency) {
            _this._pollFrequency = frequency;
        };
        /**
         * Start the chat polling
         */
        this.startEventUpdates = function (updatesLimit) {
            _this._startKeepAlive(_this._currentRoom.id, _this._user.userid || "anonymous");
            if (updatesLimit) {
                _this._maxEventsPerUpdateLimit = updatesLimit;
            }
            if (_this._polling) {
                console.log("ALREADY CONNECTED TO TALK");
                return;
            }
            if (!_this._updatesApi || !_this._currentRoom) {
                throw new errors_1.SettingsError(messages_1.NO_ROOM_SET);
            }
            if (_this._eventHandlers.onChatStart) {
                _this._eventHandlers.onChatStart();
            }
            if (!_this._eventHandlers.onChatEvent && !_this._eventHandlers.onNetworkResponse) {
                throw new errors_1.SettingsError(messages_1.NO_HANDLER_SET);
            }
            if (!_this._pollFrequency ||
                isNaN(_this._pollFrequency) ||
                _this._pollFrequency < 250 ||
                _this._pollFrequency > 5000) {
                throw new errors_1.SettingsError(INVALID_POLL_FREQUENCY);
            }
            _this._polling = setInterval(_this._fetchUpdatesAndTriggerCallbacks, _this._pollFrequency || 500);
            _this._fetchUpdatesAndTriggerCallbacks();
        };
        /**
         * Fetch updates and trigger callbacks.  Exposed as public for debug and forced manual re-polling, if needed.
         * However, marked with a starting underscore to emphasize that you are probably doing something wrong if you need this for
         * non-debug reasons.
         */
        this._fetchUpdatesAndTriggerCallbacks = function () {
            if (_this._fetching) {
                return Promise.resolve();
            }
            var cursor = _this.lastCursor;
            _this._fetching = true;
            return _this.getUpdates(cursor, _this._maxEventsPerUpdateLimit).then(_this.handleUpdates).catch(function (error) {
                if (_this._eventHandlers && _this._eventHandlers.onNetworkError) {
                    _this._eventHandlers.onNetworkError(error);
                }
                else {
                    console.log(error);
                }
                _this._fetching = false;
            });
        };
        /**
         * Stop event polling
         */
        this.stopEventUpdates = function () {
            _this._endKeepAlive();
            if (_this._polling) {
                clearInterval(_this._polling);
            }
        };
        /**
         * Get the latest events.
         */
        this.getUpdates = function (cursor, limit) {
            if (cursor === void 0) { cursor = ''; }
            if (limit === void 0) { limit = 100; }
            if (!_this._roomApi) {
                throw new errors_1.SettingsError("No room selected");
            }
            var request = {
                method: api_1.GET,
                url: _this._updatesApi + "?limit=" + limit + "&cursor=" + cursor,
                headers: _this._jsonHeaders
            };
            return network_1.stRequest(request).then(function (result) {
                if (_this._eventHandlers && _this._eventHandlers.onNetworkResponse) {
                    // @ts-ignore
                    _this._eventHandlers.onNetworkResponse(result);
                }
                if (result.data && result.data.cursor) {
                    _this.lastCursor = result.data.cursor;
                }
                return result.data;
            });
        };
        this._handleUpdate = function (event) {
            // ignore if shadowbanned.
            if (event.shadowban && (event.userid !== _this._user.userid || !_this._user)) {
                return;
            }
            if (event.eventtype == ChatModels_1.EventType.purge && _this._eventHandlers.onPurgeEvent) {
                _this._eventHandlers.onPurgeEvent(event);
                return;
            }
            if (event.eventtype == ChatModels_1.EventType.reply && _this._eventHandlers.onReply) {
                _this._eventHandlers.onReply(event);
                return;
            }
            if (event.eventtype == ChatModels_1.EventType.bounce && _this._eventHandlers.onBounce) {
                _this._eventHandlers.onBounce(event);
                return;
            }
            if (event.eventtype == ChatModels_1.EventType.reaction && _this._eventHandlers.onReaction) {
                _this._eventHandlers.onReaction(event);
                return;
            }
            if (event.eventtype == ChatModels_1.EventType.replace && _this._eventHandlers.onReplace) {
                _this._eventHandlers.onReplace(event);
                return;
            }
            if (event.eventtype == ChatModels_1.EventType.remove && _this._eventHandlers.onRemove) {
                _this._eventHandlers.onRemove(event);
                return;
            }
            if (_this._eventHandlers.onAnnouncement && (event.eventtype == ChatModels_1.EventType.announcement || event.customtype == ChatModels_1.EventType.announcement)) {
                _this._eventHandlers.onAnnouncement(event);
                return;
            }
            if (_this._eventHandlers.onChatEvent) {
                _this._eventHandlers.onChatEvent(event);
                return;
            }
        };
        /**
         * Used if message smoothing is enabled.
         * Spaces out the events so that we see a stream instead of an huge change all at once.
         * @param event
         * @param index
         */
        this._spacedUpdate = function (event, index, updateFunction, frequency) {
            var speed = frequency || _this._eventSpacingMs;
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    updateFunction(event);
                    resolve(true);
                }, index * speed);
            });
        };
        /**
         * Route the updates to appropriate handers.
         * @param update
         * @private
         */
        this.handleUpdates = function (update) { return __awaiter(_this, void 0, void 0, function () {
            var events, i, event_1, ts;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._fetching = false;
                        if (!update) {
                            return [2 /*return*/];
                        }
                        if (update.cursor) {
                            this.lastCursor = update.cursor;
                        }
                        events = update.events;
                        if (!(events && events.length)) return [3 /*break*/, 5];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < events.length)) return [3 /*break*/, 5];
                        event_1 = events[i];
                        // We already rendered this on send.
                        if (this._preRenderedMessages.has(event_1.id)) {
                            this._preRenderedMessages.delete(event_1.id);
                            return [3 /*break*/, 4];
                        }
                        ts = event_1.ts;
                        if (!this.lastTimestamp || ts > this.lastTimestamp) {
                            this.lastTimestamp = ts;
                            this.lastMessageId = event_1.id;
                        }
                        else {
                            if (!this.firstMessageTime || ts < this.firstMessageTime) {
                                this.firstMessageTime = ts;
                                this.firstMessageId = event_1.id;
                            }
                        }
                        /**
                         * Handle event conditions.
                         */
                        // skip if user is ignored.
                        if (this._ignoreList.has(event_1.userid))
                            return [3 /*break*/, 4];
                        if (!(this._smoothEventUpdates && events.length < this._maxEventBufferSize)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._spacedUpdate(event_1, i, this._handleUpdate).catch(function (error) {
                                if (_this._eventHandlers && _this._eventHandlers.onNetworkError) {
                                    return _this._eventHandlers.onNetworkError(error);
                                }
                                console.log(error);
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        this._handleUpdate(event_1);
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        /**
         * ROOM COMMANDS SECTION
         */
        /**
         * Evaluate admin commands
         * @param command
         * @param response
         * @private
         */
        this._evaluateCommandResponse = function (command, response) { return __awaiter(_this, void 0, void 0, function () {
            var onHelp, adminCommand;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (command.startsWith('*')) {
                            onHelp = this._eventHandlers.onHelp;
                            if (command.startsWith('*help') && onHelp && onHelp instanceof Function) {
                                onHelp(response);
                                return [2 /*return*/, response];
                            }
                            adminCommand = this._eventHandlers.onAdminCommand;
                            if (adminCommand && adminCommand instanceof Function) {
                                // @ts-ignore
                                adminCommand(response);
                            }
                        }
                        if (!response.data.speech) return [3 /*break*/, 2];
                        if (!this._smoothEventUpdates) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.handleUpdates({ events: [response.data.speech] })];
                    case 1:
                        _a.sent();
                        this._preRenderedMessages.add(response.data.speech.id);
                        _a.label = 2;
                    case 2: return [2 /*return*/, response];
                }
            });
        }); };
        /**
         * Send a chat command
         * @param command
         * @param options
         */
        this.executeChatCommand = function (user, command, options) {
            var data = Object.assign(options || {}, {
                command: command,
                userid: user.userid
            });
            var config = {
                method: api_1.POST,
                url: _this._commandApi,
                headers: _this._jsonHeaders,
                data: data
            };
            var errorHandler = _this._eventHandlers && _this._eventHandlers.onNetworkError;
            return network_1.stRequest(config, errorHandler).then(function (response) {
                return _this._evaluateCommandResponse(command, response);
            }).catch(function (e) {
                throw new Error(e.response.status + " " + (e.response.data && e.response.data.message ? e.response.data.message : e.response.statusText) + " - " + e.message);
            });
        };
        /**
         * Send a reply to a chat event.
         * @param user
         * @param message
         * @param replyto
         * @param options
         */
        this.sendThreadedReply = function (user, message, replyto, options) {
            // @ts-ignore
            var id = replyto.id || replyto;
            var data = Object.assign({
                body: message,
                userid: user.userid,
            }, options);
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, "chat/rooms/" + _this._currentRoom.id + "/events/" + id + "/reply"),
                headers: _this._jsonHeaders,
                data: data
            };
            return network_1.stRequest(config).catch(function (e) {
                throw e;
            });
        };
        /**
         * Send a quoted reply to a chat event.
         * @param user
         * @param message
         * @param replyto
         * @param options
         */
        this.sendQuotedReply = function (user, message, replyto, options) {
            // @ts-ignore
            var id = replyto.id || replyto;
            var data = Object.assign({
                body: message,
                userid: user.userid,
            }, options);
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, "chat/rooms/" + _this._currentRoom.id + "/events/" + id + "/quote"),
                headers: _this._jsonHeaders,
                data: data
            };
            return network_1.stRequest(config).then(function (result) {
                return result;
            }).catch(function (e) {
                throw e;
            });
        };
        /**
         * Report an event for breaking community rules
         * @param event
         * @param reason
         */
        this.reportMessage = function (event, reason) {
            // @ts-ignore
            var id = event.id || event;
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, "chat/rooms/" + _this._currentRoom.id + "/events/" + id + "/report"),
                headers: _this._jsonHeaders,
                data: reason
            };
            // @ts-ignore
            return network_1.stRequest(config).then(function (result) { return result; }).catch(function (e) {
                throw e;
            });
        };
        /**
         * Send a reaction
         * @param user
         * @param reaction
         * @param reactToMessage
         * @param options
         */
        this.reactToEvent = function (user, reaction, reactToMessage, options) {
            // @ts-ignore
            var source = reactToMessage.id || reactToMessage;
            var data = Object.assign({
                command: "",
                userid: user.userid,
                reacted: true,
                reaction: reaction
            }, options);
            var config = {
                method: api_1.POST,
                url: _this._roomApi + "/events/" + source + "/react",
                headers: _this._jsonHeaders,
                data: data
            };
            return network_1.stRequest(config).then(function (response) {
                return response.data;
            }).catch(function (e) {
                throw e;
            });
        };
        /**
         * Send an advertisement event, using SportsTalk custom events.
         * @param user
         * @param options
         */
        this.sendAdvertisement = function (user, options) {
            var data = Object.assign({
                command: options.message || "advertisement",
                eventtype: ChatModels_1.ChatOptionsEventType.custom,
                customtype: ChatModels_1.ChatOptionsEventType.ad,
                userid: user.userid,
                custompayload: JSON.stringify(options)
            });
            var config = {
                method: api_1.POST,
                headers: _this._jsonHeaders,
                data: data,
                url: _this._commandApi,
            };
            return network_1.stRequest(config).then(function (response) { return response.data; });
        };
        /**
         * Send a goal event.
         * @param user
         * @param img
         * @param message
         * @param options
         */
        this.sendGoal = function (user, img, message, options) {
            var defaultOptions = {
                "img": img,
                "link": ""
            };
            // Allow safe 'then' when an object or event is passed into the function call.
            if (message && typeof message !== 'string') {
                message = 'GOAL!';
            }
            var data = Object.assign({
                command: message || 'GOAL!',
                eventtype: ChatModels_1.ChatOptionsEventType.custom,
                customtype: ChatModels_1.CustomEventTypes.goal,
                userid: user.userid,
                custompayload: JSON.stringify(Object.assign(defaultOptions, options))
            });
            return network_1.stRequest({
                method: api_1.POST,
                url: _this._commandApi,
                headers: _this._jsonHeaders,
                data: data
            }).then(function (response) {
                return response;
            });
        };
        /**
         * Removes an event from the server.  This cannot be reversed.  This can leave some content orphaned if there are replies.
         * Typically, you should use the `flagEventLogicallyDeleted` method instead, with `permanentIfNoReplies` set to `true`
         * @param user
         * @param event
         */
        this.permanetlyDeleteEvent = function (user, event) {
            if (!event) {
                throw new Error("Cannot delete a null or undefined event");
            }
            // @ts-ignore
            var userid = user.userid || user;
            // @ts-ignore
            var id = event.id || event;
            if (!id) {
                throw new Error("Cannot delete an event without an id");
            }
            var config = {
                method: api_1.DELETE,
                url: utils_1.buildAPI(_this._config, "chat/rooms/" + _this._currentRoom.id + "/events/" + id),
                headers: _this._jsonHeaders,
            };
            // @ts-ignore
            return network_1.stRequest(config).then(function (result) {
                return result;
            }).catch(function (e) {
                throw new Error(e.response.status + " " + (e.response.data && e.response.data.message ? e.response.data.message : e.response.statusText) + " - " + e.message);
            });
        };
        /**
         * Flags an event as deleted so it is not sent in updates or scrollback, however the content is kept on the server.
         * @param user
         * @param event
         * @param permanentIfNoReplies if true, this becomes a permanent delete if there are no replies.
         */
        this.flagEventLogicallyDeleted = function (user, event, permanentIfNoReplies) {
            if (permanentIfNoReplies === void 0) { permanentIfNoReplies = false; }
            if (!event) {
                throw new Error("Cannot delete a null or undefined event");
            }
            // @ts-ignore
            var userid = user.userid || user;
            // @ts-ignore
            var id = event.id || event;
            if (!id) {
                throw new Error("Cannot delete an event without an id");
            }
            var config = {
                method: api_1.PUT,
                headers: _this._jsonHeaders,
                url: utils_1.buildAPI(_this._config, "chat/rooms/" + _this._currentRoom.id + "/events/" + id + "/setdeleted?userid=" + userid + "&deleted=true&permanentifnoreplies=" + permanentIfNoReplies)
            };
            // @ts-ignore
            return network_1.stRequest(config).then(function (result) {
                return result;
            }).catch(function (e) {
                throw new Error(e.response.status + " " + (e.response.data && e.response.data.message ? e.response.data.message : e.response.statusText) + " - " + e.message + ", config:" + JSON.stringify(config));
            });
        };
        /**
         * Lists events going backwards in time.
         * @param cursor
         * @param limit
         */
        this.listPreviousEvents = function (cursor, limit) {
            if (cursor === void 0) { cursor = ''; }
            if (limit === void 0) { limit = 100; }
            if (!_this._roomApi) {
                throw new errors_1.SettingsError("No room selected");
            }
            var previousCursor = cursor || _this.oldestCursor || '';
            return network_1.stRequest({
                method: api_1.GET,
                url: _this._roomApi + "/listpreviousevents?cursor=" + (previousCursor ? previousCursor : '') + "&limit=" + (limit ? limit : 100),
                headers: _this._jsonHeaders
            }).then(function (result) {
                if (!cursor) {
                    _this.oldestCursor = result.data ? result.data.cursor : _this.oldestCursor;
                }
                return result.data;
            });
        };
        /**
         * This is used for bulk export.  Typically not used in real-time application
         * This will return all events regardless of active/inactive status.
         * @param cursor
         * @param limit
         */
        this.listEventsHistory = function (cursor, limit) {
            if (cursor === void 0) { cursor = ''; }
            if (limit === void 0) { limit = 100; }
            if (!_this._roomApi) {
                throw new errors_1.SettingsError("No room selected");
            }
            return network_1.stRequest({
                method: api_1.GET,
                url: _this._roomApi + "/listeventshistory?cursor=" + (cursor ? cursor : '') + "&limit=" + (limit ? limit : 100),
                headers: _this._jsonHeaders
            }).then(function (result) {
                return result.data;
            });
        };
        this.searchEventHistory = function (params) {
            if (params.fromhandle && params.fromuserid) {
                throw new errors_1.SettingsError("Search for ID or Handle, not both");
            }
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, "chat/searchevents"),
                headers: _this._jsonHeaders,
                data: params
            };
            return network_1.stRequest(config).then(function (result) { return result.data; });
        };
        this.listEventsByType = function (type) {
            return network_1.stRequest({
                method: api_1.GET,
                url: _this._roomApi + "/listeventsbytype?eventtype=" + type,
                headers: _this._jsonHeaders
            }).then(function (result) { return result.data; });
        };
        this.updateChatEvent = function (event, body, user) {
            //@ts-ignore
            var userid = user ? user.userid || user : _this._user.userid;
            var eventid = utils_1.forceObjKeyOrString(event, 'id');
            if (!userid) {
                throw new Error("Require a valid userid to update a Chat Event.");
            }
            var config = {
                method: api_1.PUT,
                url: utils_1.buildAPI(_this._config, "chat/rooms/" + _this._currentRoom.id + "/events/" + eventid),
                headers: _this._jsonHeaders,
                data: {
                    userid: userid,
                    body: body
                }
            };
            return network_1.stRequest(config).then(function (result) { return result.data; });
        };
        this.listEventsByTimestamp = function (query) {
            if (!query || !query.ts) {
                throw new Error("Must provide a timestamp value to list events");
            }
            var config = {
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, "/chat/rooms/" + _this._currentRoom.id + "}/eventsbytimestamp/list/" + query.ts + "?limitolder=" + (query.limitolder ? query.limitolder : 0) + "&limitnewer=" + (query.limitnewer ? query.limitnewer : 0)),
                headers: _this._jsonHeaders,
            };
            return network_1.stRequest(config).then(function (result) { return result.data; });
        };
        this.setConfig(config);
        this.setEventHandlers(eventHandlers);
    }
    return RestfulChatEventService;
}());
exports.RestfulChatEventService = RestfulChatEventService;

}).call(this)}).call(this,require('_process'))
},{"../../../models/ChatModels":16,"../../constants/api":11,"../../constants/messages":12,"../../errors":13,"../../network":14,"../../utils":15,"_process":52}],4:[function(require,module,exports){
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
                url: utils_1.buildAPI(_this._config, "/chat/rooms/" + roomid + "/usereffects"),
                headers: _this._jsonHeaders
            };
            return network_1.stRequest(config).then(function (response) { return response.data; });
        };
        this.applyFlagModerationDecision = function (user, room, approve) {
            var roomid = utils_1.forceObjKeyOrString(room);
            var userid = utils_1.forceObjKeyOrString(user, 'userid');
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, "/chat/rooms/" + roomid + "/moderation/flaggedusers/" + userid + "/applydecision"),
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
                url: utils_1.buildAPI(_this._config, "/chat/rooms/" + roomid + "/mute"),
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
                url: utils_1.buildAPI(_this._config, "/chat/rooms/" + roomid + "/mute"),
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
                url: utils_1.buildAPI(_this._config, "/chat/rooms/" + roomId + "/commands/purge/" + userId),
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

},{"../../constants/api":11,"../../network":14,"../../utils":15}],5:[function(require,module,exports){
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
            }).catch(function (e) {
                throw new Error(e);
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
            var query = utils_1.queryStringify({
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

},{"../../../models/Moderation":19,"../../constants/api":11,"../../errors":13,"../../network":14,"../../utils":15}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUrlConversationId = exports.getUrlCommentId = void 0;
/**
 * Helper for finding the id of a comment
 * @param comment
 */
function getUrlCommentId(comment) {
    // @ts-ignore
    var id = comment.id || comment;
    if (typeof id !== 'string') {
        return "";
    }
    return encodeURIComponent(id);
}
exports.getUrlCommentId = getUrlCommentId;
/**
 * Helper for finding the id of a comments
 * @param conversation
 */
function getUrlConversationId(conversation) {
    // @ts-ignore
    var id = conversation.conversationid || conversation;
    if (typeof id !== 'string') {
        return "";
    }
    return encodeURIComponent(id);
}
exports.getUrlConversationId = getUrlConversationId;

},{}],7:[function(require,module,exports){
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
exports.RestfulCommentService = void 0;
var CommonModels_1 = require("../../../models/CommonModels");
var api_1 = require("../../constants/api");
var utils_1 = require("../../utils");
var ConversationUtils_1 = require("./ConversationUtils");
var errors_1 = require("../../errors");
var messages_1 = require("../../constants/messages");
var network_1 = require("../../network");
/**
 * This is the primary comment service, which handles posting and responding to comments.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
var RestfulCommentService = /** @class */ (function () {
    /**
     * Create a new CommentService
     * @param config
     * @param conversation
     */
    function RestfulCommentService(config) {
        var _this = this;
        this._apiExt = 'comment/conversations';
        /**
         * Set config
         * @param config
         * @param conversation
         */
        this.setConfig = function (config) {
            _this._config = config;
            _this._apiHeaders = utils_1.getUrlEncodedHeaders(_this._config.apiToken, _this._config.userToken);
            _this._jsonHeaders = utils_1.getJSONHeaders(_this._config.apiToken, _this._config.userToken);
            return config;
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
         * Used to ensure we have a user or throw a helpful error.
         * @param user
         * @private
         */
        this._requireUser = function (user) {
            if (!user) {
                throw new errors_1.RequireUserError(messages_1.MUST_SET_USER);
            }
            if (!user.userid) {
                throw new errors_1.RequireUserError(messages_1.USER_NEEDS_ID);
            }
        };
        this._requireConversationId = function (id) {
            if (!id) {
                throw new errors_1.ValidationError(messages_1.NO_CONVERSATION_SET);
            }
        };
        /**
         * build a non-reply comment.
         * @param comment
         * @param user
         * @private
         */
        this._buildUserComment = function (comment, user) {
            var final = comment;
            if (typeof comment === 'string') {
                final = { body: comment };
            }
            return Object.assign({}, final, user);
        };
        /**
         * Get the current comments. May be null.
         */
        this.getConversation = function () {
            return _this._conversation;
        };
        /**
         * Create a comment
         * @param comment
         * @param user
         * @param replyto
         */
        this.publishComment = function (conversationId, comment, user, replyto) {
            _this._requireConversationId(conversationId);
            // @ts-ignore
            var replyid = replyto || comment.replyto;
            _this._requireUser(user || comment);
            var finalComment = _this._buildUserComment(comment, user);
            if (!replyid) {
                return _this._makeComment(conversationId, finalComment);
            }
            return _this._makeReply(conversationId, finalComment, replyid);
        };
        /**
         * Make a non-reply comment
         * @param comment
         * @private
         */
        this._makeComment = function (conversationId, comment) {
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + conversationId + "/comments"),
                headers: _this._jsonHeaders,
                data: comment
            };
            return network_1.stRequest(config).then(function (result) {
                return result.data;
            });
        };
        /**
         * Create a replyto comment
         * @param comment
         * @param replyTo
         * @private
         */
        this._makeReply = function (conversationId, comment, replyTo) {
            // @ts-ignore
            var replyId = replyTo.id || replyTo || comment.replyto;
            if (!replyId || !(typeof replyId === 'string')) {
                throw new errors_1.ValidationError(messages_1.MISSING_REPLYTO_ID);
            }
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + conversationId + "/comments/" + replyId),
                headers: _this._jsonHeaders,
                data: comment
            };
            return network_1.stRequest(config).then(function (result) {
                return result.data;
            }).catch(function (e) {
                throw e;
            });
        };
        /**
         * Get a specific comment.
         * @param comment
         */
        this.getComment = function (conversationId, comment) {
            _this._requireConversationId(conversationId);
            var id = ConversationUtils_1.getUrlCommentId(comment);
            var config = {
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + conversationId + "/comments/" + id),
                headers: _this._jsonHeaders,
            };
            return network_1.stRequest(config).then(function (result) {
                return result.data;
            }).catch(function (e) {
                if (e.response.status === 404) {
                    return null;
                }
                throw e;
            });
        };
        /**
         * Delete a comment, irrevocable.
         * @param comment
         * @param user
         * @private
         */
        this._finalDelete = function (conversationId, comment, user) { return __awaiter(_this, void 0, void 0, function () {
            var id, config, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = ConversationUtils_1.getUrlCommentId(comment);
                        config = {
                            method: api_1.DELETE,
                            url: utils_1.buildAPI(this._config, this._apiExt + "/" + conversationId + "/comments/" + id),
                            headers: this._jsonHeaders,
                        };
                        return [4 /*yield*/, network_1.stRequest(config)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.data];
                }
            });
        }); };
        /**
         * Mark a comment as deleted. This can be recovered by admins later.
         * @param comment
         * @param user
         * @private
         */
        this._markDeleted = function (conversationId, comment, user) { return __awaiter(_this, void 0, void 0, function () {
            var id, config;
            return __generator(this, function (_a) {
                this._requireUser(user);
                id = ConversationUtils_1.getUrlCommentId(comment);
                config = {
                    method: api_1.PUT,
                    url: utils_1.buildAPI(this._config, this._apiExt + "/" + conversationId + "/comments/" + id + "/setdeleted?userid=" + user.userid + "&deleted=true&permanentifnoreplies=false"),
                    headers: this._jsonHeaders,
                };
                return [2 /*return*/, network_1.stRequest(config).then(function (result) {
                        var comment = result.data;
                        // @ts-ignore
                        var response = {
                            kind: CommonModels_1.Kind.deletedcomment,
                            conversationid: comment.conversationid,
                            commentid: comment.id,
                            deletedComments: 1
                        };
                        return response;
                    })];
            });
        }); };
        /**
         * Delete a comment
         * @param comment
         * @param user
         * @param final
         */
        this.deleteComment = function (conversationId, comment, user, final) {
            _this._requireConversationId(conversationId);
            if (final) {
                return _this._finalDelete(conversationId, comment, user);
            }
            return _this._markDeleted(conversationId, comment, user);
        };
        /**
         * Update a comment
         * @param comment
         */
        this.updateComment = function (conversationId, comment) {
            _this._requireConversationId(conversationId);
            var id = ConversationUtils_1.getUrlCommentId(comment);
            return network_1.stRequest({
                method: api_1.PUT,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + conversationId + "/comments/" + id),
                headers: _this._jsonHeaders,
                data: {
                    body: comment.body,
                    userid: comment.userid
                }
            }).then(function (result) {
                return result.data;
            });
        };
        /**
         *
         * @param comment The comment or comment ID to react to.
         * @param reaction The reaction type.  Currently only "like" is supported and built-in.
         * @param enable Whether the reaction should be toggled on or off, defaults to true.
         */
        this.react = function (conversationId, comment, user, reaction, enable) {
            if (enable === void 0) { enable = true; }
            _this._requireConversationId(conversationId);
            _this._requireUser(user);
            var id = ConversationUtils_1.getUrlCommentId(comment);
            var data = {
                userid: user.userid,
                reaction: reaction,
                reacted: enable ? true : false // null protection.
            };
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + conversationId + "/comments/" + id + "/react"),
                headers: _this._jsonHeaders,
                data: data
            };
            return network_1.stRequest(config).then(function (result) {
                return result.data;
            });
        };
        /**
         * Vote on a comment
         * @param comment
         * @param user
         * @param vote
         */
        this.vote = function (conversationId, comment, user, vote) {
            _this._requireConversationId(conversationId);
            _this._requireUser(user);
            var id = ConversationUtils_1.getUrlCommentId(comment);
            var request = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + conversationId + "/comments/" + id + "/vote"),
                headers: _this._jsonHeaders,
                data: {
                    vote: vote,
                    userid: user.userid
                }
            };
            return network_1.stRequest(request).then(function (result) {
                return result.data;
            });
        };
        /**
         * Report a comment to admins for moderation
         * @param comment
         * @param user
         * @param reporttype
         */
        this.report = function (conversationId, comment, user, reporttype) {
            _this._requireConversationId(conversationId);
            _this._requireUser(user);
            var id = ConversationUtils_1.getUrlCommentId(comment);
            return network_1.stRequest({
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + conversationId + "/comments/" + id + "/report"),
                headers: _this._jsonHeaders,
                data: {
                    reporttype: reporttype,
                    userid: user.userid
                }
            }).then(function (result) {
                return result.data;
            });
        };
        /**
         * Gets the replies for a specific comment
         * @param comment
         * @param request
         */
        this.getReplies = function (conversationId, comment, request) {
            _this._requireConversationId(conversationId);
            var id = ConversationUtils_1.getUrlCommentId(comment);
            var requestString = utils_1.formify(request);
            return network_1.stRequest({
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + conversationId + "/comments/" + id + "/replies/?" + requestString),
                headers: _this._jsonHeaders,
                data: request
            }).then(function (result) {
                return {
                    conversation: result.data.conversation,
                    comments: result.data.comments
                };
            });
        };
        /**
         * Get comments for a comments.
         * @param request
         * @param conversation
         */
        this.listComments = function (conversation, request) {
            if (!conversation) {
                throw new errors_1.ValidationError(messages_1.MUST_SPECIFY_CONVERSATION);
            }
            var id = ConversationUtils_1.getUrlConversationId(conversation);
            _this._requireConversationId(id);
            var config = {
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + id + "/comments", request),
                headers: _this._jsonHeaders,
            };
            return network_1.stRequest(config).then(function (result) {
                var _a = result.data, conversation = _a.conversation, comments = _a.comments, cursor = _a.cursor, more = _a.more;
                return {
                    conversation: conversation,
                    comments: comments,
                    cursor: cursor,
                    more: more
                };
            });
        };
        this.listRepliesBatch = function (conversation, parentids, childlimit) {
            if (childlimit === void 0) { childlimit = 50; }
            var id = ConversationUtils_1.getUrlConversationId(conversation);
            _this._requireConversationId(id);
            if (!parentids || !parentids.length) {
                throw new errors_1.ValidationError('Must provide a list of parent comment IDs');
            }
            var config = {
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + id + "/repliesbyparentidbatch", { parentids: parentids, childlimit: childlimit }),
                headers: _this._jsonHeaders,
            };
            return network_1.stRequest(config).then(function (resp) { return resp.data; });
        };
        if (config) {
            this.setConfig(config);
        }
    }
    return RestfulCommentService;
}());
exports.RestfulCommentService = RestfulCommentService;

},{"../../../models/CommonModels":18,"../../constants/api":11,"../../constants/messages":12,"../../errors":13,"../../network":14,"../../utils":15,"./ConversationUtils":6}],8:[function(require,module,exports){
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
exports.RestfulConversationService = void 0;
var api_1 = require("../../constants/api");
var utils_1 = require("../../utils");
var ConversationUtils_1 = require("./ConversationUtils");
var network_1 = require("../../network");
/**
 * This is the class that governs the lifecycle of conversations.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
var RestfulConversationService = /** @class */ (function () {
    /**
     * Create a new comments service
     * @param config
     */
    function RestfulConversationService(config) {
        var _this = this;
        this._apiExt = 'comment/conversations';
        this.request = network_1.bindJWTUpdates(this);
        this.getCurrentUser = function () {
            return _this._config.user;
        };
        this.getUserToken = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._config.userToken || ''];
            });
        }); };
        this.refreshUserToken = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this._config.userTokenRefreshFunction) {
                    return [2 /*return*/, this._config.userTokenRefreshFunction(this._config.userToken || '')];
                }
                return [2 /*return*/, ''];
            });
        }); };
        this.setUser = function (user) {
            _this._config.user = user;
        };
        /**
         * Set configuraiton
         * @param config
         */
        this.setConfig = function (config) {
            _this._config = config;
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
         * Create a comments
         * @param settings
         */
        this.createConversation = function (settings) {
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, _this._apiExt),
                headers: _this._jsonHeaders,
                data: settings,
            };
            return _this.request(config).then(function (result) {
                return result.data;
            });
        };
        /**
         * Get a conversation object
         * @param conversation
         */
        this.getConversation = function (conversation) {
            // @ts-ignore
            var id = ConversationUtils_1.getUrlConversationId(conversation);
            if (!id) {
                throw new Error("Must supply a conversationid to get a conversation");
            }
            var config = {
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + id),
                headers: _this._jsonHeaders,
            };
            return _this.request(config).then(function (result) {
                return result.data;
            });
        };
        this.reactToConversationTopic = function (conversation, reaction, user) {
            if (reaction === void 0) { reaction = { reaction: 'like', reacted: true }; }
            var id = ConversationUtils_1.getUrlConversationId(conversation);
            var reactingUser = user || _this._config.user;
            var userid = utils_1.forceObjKeyOrString(reactingUser, 'userid');
            if (!reaction) {
                throw new Error("Must provide a ReactionCommand object to react or send nothing to do a default like");
            }
            if (!userid) {
                throw new Error("Must send a userid to react to a conversation topic");
            }
            if (!id) {
                throw new Error("Must have a conversation ID to react to a conversation topic");
            }
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, "comment/conversations/" + id + "/react/"),
                headers: _this._jsonHeaders,
                data: {
                    reaction: reaction.reaction || 'like',
                    reacted: reaction.reacted || true,
                    userid: userid,
                }
            };
            return _this.request(config).then(function (result) {
                return result.data;
            });
        };
        /**
         * Get a conversation object
         * @param conversation
         */
        this.getConversationByCustomId = function (conversation) {
            // @ts-ignore
            var id = ConversationUtils_1.getUrlConversationId(conversation, 'customid');
            var config = {
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, "comment/find/conversation/bycustomid?customid=" + id),
                headers: _this._jsonHeaders,
            };
            return _this.request(config).then(function (result) {
                return result.data;
            });
        };
        /**
         * Deletes a conversation and all the comments in it.
         */
        this.deleteConversation = function (conversation) {
            // @ts-ignore
            var id = ConversationUtils_1.getUrlConversationId(conversation);
            // @ts-ignore
            var config = {
                method: api_1.DELETE,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + id),
                headers: _this._jsonHeaders,
            };
            return _this.request(config);
        };
        /**
         * List available conversations
         * @param filter
         */
        this.listConversations = function (filter) {
            var query = "";
            if (filter) {
                query = "?" + utils_1.formify(filter);
            }
            var config = {
                method: api_1.GET,
                url: utils_1.buildAPI(_this._config, _this._apiExt + "/" + query),
                headers: _this._jsonHeaders,
            };
            return _this.request(config).then(function (response) { return response.data; });
        };
        if (config) {
            this.setConfig(config);
        }
    }
    RestfulConversationService.prototype.getTokenExp = function () {
        return 0;
    };
    RestfulConversationService.prototype.getConversationBatchDetails = function (conversations, options) {
        //@ts-ignore
        var ids = [].concat(conversations).map(function (conversation) {
            //@ts-ignore
            return conversation.conversationid ? conversation.conversationid : conversation;
        });
        var requestOptions = Object.assign({}, options || {});
        var cids = [].concat(requestOptions.cid).join(',');
        var entities = [].concat(requestOptions.entities).join(',');
        var config = {
            method: api_1.GET,
            url: utils_1.buildAPI(this._config, this._apiExt + "/details/batch?ids=" + ids.join(',') + (cids ? '&cid=' + cids : '') + (entities ? '&entities=' + entities : '')),
            headers: this._jsonHeaders
        };
        return this.request(config).then(function (response) { return response.data; });
    };
    return RestfulConversationService;
}());
exports.RestfulConversationService = RestfulConversationService;

},{"../../constants/api":11,"../../network":14,"../../utils":15,"./ConversationUtils":6}],9:[function(require,module,exports){
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

},{"../../../models/ChatModels":16,"../../constants/api":11,"../../errors":13,"../../network":14,"../../utils":15,"jwt-decode":51}],10:[function(require,module,exports){
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
            var id = utils_1.forceObjKeyOrString(userToReport, 'userid');
            var reporter = utils_1.forceObjKeyOrString(reportedBy, 'userid');
            var data = {
                userid: reporter,
                reporttype: reportType
            };
            var config = {
                method: api_1.POST,
                url: utils_1.buildAPI(_this._config, "user/users/" + id + "/report"),
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

},{"../../../models/Moderation":19,"../../../models/user/User":20,"../../constants/api":11,"../../network":14,"../../utils":15}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.THROTTLE_ERROR = exports.USER_NEEDS_ID = exports.USER_NEEDS_HANDLE = exports.REQUIRE_ROOM_ID = exports.NO_ROOM_SET = exports.NO_HANDLER_SET = exports.NO_CONVERSATION_SET = exports.MUST_SPECIFY_CONVERSATION = exports.MUST_SET_APPID = exports.MUST_SET_USER = exports.MISSING_ROOM = exports.MISSING_REPLYTO_ID = void 0;
exports.MISSING_REPLYTO_ID = "Need a replyto message ID to reply";
exports.MISSING_ROOM = 'Need to join a room first!';
exports.MUST_SET_USER = "Must set user";
exports.MUST_SET_APPID = "Must set an AppID";
exports.MUST_SPECIFY_CONVERSATION = "Must set a comments in method call or set a default";
exports.NO_CONVERSATION_SET = "Need to set a valid conversation with a conversationid";
exports.NO_HANDLER_SET = "No event handler set";
exports.NO_ROOM_SET = 'No room set.  You must join a room before you can get updates!';
exports.REQUIRE_ROOM_ID = 'Room must have an id';
exports.USER_NEEDS_HANDLE = "User requires a handle";
exports.USER_NEEDS_ID = "User needs an ID";
exports.THROTTLE_ERROR = "405 - Not Allowed. Please wait to send this message again";

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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
                        return errorHandlerfunction(e, config);
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
    var exp, token;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                exp = target.getTokenExp();
                if (!(exp && exp < new Date().getTime() - 20)) return [3 /*break*/, 2];
                return [4 /*yield*/, target.refreshUserToken()];
            case 1:
                token = _a.sent();
                if (token) {
                    config.headers['Authorization'] = "Bearer " + token;
                }
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

},{"axios":22}],15:[function(require,module,exports){
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

},{"./constants/api":11,"./errors":13}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventModerationState = exports.ChatOptionsEventType = exports.CustomEventTypes = exports.EventType = void 0;
var EventType;
(function (EventType) {
    EventType["speech"] = "speech";
    EventType["purge"] = "purge";
    EventType["mute"] = "mute";
    EventType["bounce"] = "bounce";
    EventType["reaction"] = "reaction";
    EventType["replace"] = "replace";
    EventType["remove"] = "remove";
    EventType["roomClosed"] = "roomclosed";
    EventType["roomOpen"] = "roomopened";
    EventType["action"] = "action";
    EventType["reply"] = "reply";
    EventType["quote"] = "quote";
    EventType["ad"] = "ad";
    EventType["exit"] = "exit";
    EventType["enter"] = "enter";
    EventType["announcement"] = "announcement";
    EventType["custom"] = "custom";
})(EventType = exports.EventType || (exports.EventType = {}));
exports.CustomEventTypes = {
    goal: "goal" // custom type
};
var ChatOptionsEventType;
(function (ChatOptionsEventType) {
    ChatOptionsEventType["announcement"] = "announcement";
    ChatOptionsEventType["custom"] = "custom";
    ChatOptionsEventType["ad"] = "ad";
})(ChatOptionsEventType = exports.ChatOptionsEventType || (exports.ChatOptionsEventType = {}));
var EventModerationState;
(function (EventModerationState) {
    EventModerationState["na"] = "na";
    EventModerationState["approved"] = "approved";
    EventModerationState["rejected"] = "rejected";
})(EventModerationState = exports.EventModerationState || (exports.EventModerationState = {}));

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModeration = exports.Vote = exports.ListSortDirection = exports.CommentSortMethod = exports.CommentType = exports.ModerationType = exports.Kind = void 0;
var CommonModels_1 = require("./CommonModels");
Object.defineProperty(exports, "Kind", { enumerable: true, get: function () { return CommonModels_1.Kind; } });
var Moderation_1 = require("./Moderation");
Object.defineProperty(exports, "ModerationType", { enumerable: true, get: function () { return Moderation_1.ModerationType; } });
var CommentType;
(function (CommentType) {
    CommentType["comment"] = "comment";
})(CommentType = exports.CommentType || (exports.CommentType = {}));
var CommentSortMethod = /** @class */ (function () {
    function CommentSortMethod() {
    }
    CommentSortMethod.reaction = function (type) { return "reaction-" + type; };
    return CommentSortMethod;
}());
exports.CommentSortMethod = CommentSortMethod;
var ListSortDirection;
(function (ListSortDirection) {
    ListSortDirection["forward"] = "forward";
    ListSortDirection["backward"] = "backward";
})(ListSortDirection = exports.ListSortDirection || (exports.ListSortDirection = {}));
var Vote;
(function (Vote) {
    Vote["up"] = "up";
    Vote["down"] = "down";
    Vote["none"] = "";
})(Vote = exports.Vote || (exports.Vote = {}));
var CommentModeration;
(function (CommentModeration) {
    CommentModeration["flagged"] = "flagged";
    CommentModeration["rejected"] = "rejected";
    CommentModeration["approved"] = "approved";
})(CommentModeration = exports.CommentModeration || (exports.CommentModeration = {}));

},{"./CommonModels":18,"./Moderation":19}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebStatusString = exports.WebStatusCode = exports.Reaction = exports.Kind = void 0;
var Kind;
(function (Kind) {
    Kind["chat"] = "chat.event";
    Kind["chatsubscription"] = "chat.subscription";
    Kind["roomusereffects"] = "chat.list.roomusereffects";
    Kind["room"] = "chat.room";
    Kind["userroomsubscriptions"] = "chat.list.userroomsubscriptions";
    Kind["notification"] = "notification";
    Kind["bounce"] = "chat.bounceuser";
    Kind["user"] = "app.user";
    Kind["api"] = "api.result";
    Kind["webhook"] = "webhook.webhook";
    Kind["webhookevent"] = "webhook.event";
    Kind["webhooklogs"] = "list.webhook.logentries";
    Kind["webhookcommentpayload"] = "webhook.payload.comment";
    Kind["webhookcommentreplypayload"] = "webhook.payload.commentreply";
    Kind["chatcommand"] = "chat.executecommand";
    Kind["conversation"] = "comment.conversation";
    Kind["deletedconversation"] = "delete.conversation";
    Kind["comment"] = "comment.comment";
    Kind["deletedcomment"] = "delete.comment";
    Kind["deletedroom"] = "deleted.room";
    Kind["deleteduser"] = "deleted.appuser";
    Kind["conversationlist"] = "list.commentconversations";
    Kind["chatlist"] = "list.chatevents";
    Kind["eventlist"] = "list.events";
    Kind["roomlist"] = "list.chatrooms";
    Kind["userlist"] = "list.users";
    Kind["repliesbyparentidlist"] = "list.repliesbyparentid";
    Kind["commentreplygrouplist"] = "list.commentreplygroup";
    Kind["chatroomextendeddetails"] = "chat.room.list.extendeddetails";
    Kind["conversationdetailslist"] = "list.comment.conversation.details";
})(Kind = exports.Kind || (exports.Kind = {}));
var Reaction;
(function (Reaction) {
    Reaction["like"] = "like";
})(Reaction = exports.Reaction || (exports.Reaction = {}));
var WebStatusCode;
(function (WebStatusCode) {
    WebStatusCode[WebStatusCode["OK"] = 200] = "OK";
    WebStatusCode[WebStatusCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    WebStatusCode[WebStatusCode["SERVER_ERROR"] = 500] = "SERVER_ERROR";
})(WebStatusCode = exports.WebStatusCode || (exports.WebStatusCode = {}));
var WebStatusString;
(function (WebStatusString) {
    WebStatusString["OK"] = "OK";
})(WebStatusString = exports.WebStatusString || (exports.WebStatusString = {}));

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportType = exports.ModerationType = void 0;
var ModerationType;
(function (ModerationType) {
    ModerationType["pre"] = "pre";
    ModerationType["post"] = "post";
})(ModerationType = exports.ModerationType || (exports.ModerationType = {}));
var ReportType;
(function (ReportType) {
    ReportType["abuse"] = "abuse";
    ReportType["spam"] = "spam";
})(ReportType = exports.ReportType || (exports.ReportType = {}));

},{}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSearchType = exports.UserRole = exports.UserModerationState = void 0;
exports.UserModerationState = {
    Flagged: 'flagged',
    Approved: 'approved',
    Rejected: 'rejected'
};
var UserRole;
(function (UserRole) {
    UserRole["admin"] = "admin";
    UserRole["moderator"] = "moderator";
    UserRole["user"] = "user";
})(UserRole = exports.UserRole || (exports.UserRole = {}));
/**
 * Used only for searching users by API.  A sear
 */
var UserSearchType;
(function (UserSearchType) {
    UserSearchType["handle"] = "handle";
    UserSearchType["name"] = "name";
    UserSearchType["userid"] = "userid";
})(UserSearchType = exports.UserSearchType || (exports.UserSearchType = {}));

},{}],21:[function(require,module,exports){
// @Sportstalk Client 3.7.x
(function (window) {
    var chatClient = require('./impl/ChatClient');
    var commentClient = require('./impl/CommentClient');
    var chatModels = require('./models/ChatModels');
    var commonModels = require('./models/CommonModels');
    var conversationModels = require('./models/CommentsModels');
    if (window) {
        // @ts-ignore
        var ChatClient = window.ChatClient || chatClient.default || chatClient.ChatClient || chatClient;
        // @ts-ignore
        var CommentClient = window.CommentClient || commentClient.default || commentClient.CommentClient || commentClient;
        // @ts-ignore
        window.ChatClient = ChatClient;
        // @ts-ignore
        window.CommentClient = CommentClient;
        // @ts-ignore
        window.SportsTalk = {};
        // @ts-ignore
        window.Conversation = {};
        // @ts-ignore
        window.SportsTalk.chat = {};
        // @ts-ignore
        window.SportsTalk.chat.Models = chatModels;
        // @ts-ignore
        window.SportsTalk.comments = {};
        // @ts-ignore
        window.SportsTalk.common = {};
        // @ts-ignore
        window.SportsTalk.common.Models = commonModels;
        // @ts-ignore
        window.SportsTalk.comments.Models = conversationModels;
    }
    console.log("Chat and commenting powered by Sportstalk247");
})(window);

},{"./impl/ChatClient":1,"./impl/CommentClient":2,"./models/ChatModels":16,"./models/CommentsModels":17,"./models/CommonModels":18}],22:[function(require,module,exports){
module.exports = require('./lib/axios');
},{"./lib/axios":24}],23:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var settle = require('./../core/settle');
var cookies = require('./../helpers/cookies');
var buildURL = require('./../helpers/buildURL');
var buildFullPath = require('../core/buildFullPath');
var parseHeaders = require('./../helpers/parseHeaders');
var isURLSameOrigin = require('./../helpers/isURLSameOrigin');
var createError = require('../core/createError');

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        config.transitional && config.transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

},{"../core/buildFullPath":30,"../core/createError":31,"./../core/settle":35,"./../helpers/buildURL":39,"./../helpers/cookies":41,"./../helpers/isURLSameOrigin":44,"./../helpers/parseHeaders":46,"./../utils":49}],24:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var mergeConfig = require('./core/mergeConfig');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

// Expose isAxiosError
axios.isAxiosError = require('./helpers/isAxiosError');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;

},{"./cancel/Cancel":25,"./cancel/CancelToken":26,"./cancel/isCancel":27,"./core/Axios":28,"./core/mergeConfig":34,"./defaults":37,"./helpers/bind":38,"./helpers/isAxiosError":43,"./helpers/spread":47,"./utils":49}],25:[function(require,module,exports){
'use strict';

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;

},{}],26:[function(require,module,exports){
'use strict';

var Cancel = require('./Cancel');

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;

},{"./Cancel":25}],27:[function(require,module,exports){
'use strict';

module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

},{}],28:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var buildURL = require('../helpers/buildURL');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');
var mergeConfig = require('./mergeConfig');
var validator = require('../helpers/validator');

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean, '1.0.0'),
      forcedJSONParsing: validators.transitional(validators.boolean, '1.0.0'),
      clarifyTimeoutError: validators.transitional(validators.boolean, '1.0.0')
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;

},{"../helpers/buildURL":39,"../helpers/validator":48,"./../utils":49,"./InterceptorManager":29,"./dispatchRequest":32,"./mergeConfig":34}],29:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;

},{"./../utils":49}],30:[function(require,module,exports){
'use strict';

var isAbsoluteURL = require('../helpers/isAbsoluteURL');
var combineURLs = require('../helpers/combineURLs');

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};

},{"../helpers/combineURLs":40,"../helpers/isAbsoluteURL":42}],31:[function(require,module,exports){
'use strict';

var enhanceError = require('./enhanceError');

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};

},{"./enhanceError":33}],32:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var transformData = require('./transformData');
var isCancel = require('../cancel/isCancel');
var defaults = require('../defaults');

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};

},{"../cancel/isCancel":27,"../defaults":37,"./../utils":49,"./transformData":36}],33:[function(require,module,exports){
'use strict';

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};

},{}],34:[function(require,module,exports){
'use strict';

var utils = require('../utils');

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};

},{"../utils":49}],35:[function(require,module,exports){
'use strict';

var createError = require('./createError');

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};

},{"./createError":31}],36:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var defaults = require('./../defaults');

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};

},{"./../defaults":37,"./../utils":49}],37:[function(require,module,exports){
(function (process){(function (){
'use strict';

var utils = require('./utils');
var normalizeHeaderName = require('./helpers/normalizeHeaderName');
var enhanceError = require('./core/enhanceError');

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require('./adapters/xhr');
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = require('./adapters/http');
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  },

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

}).call(this)}).call(this,require('_process'))
},{"./adapters/http":23,"./adapters/xhr":23,"./core/enhanceError":33,"./helpers/normalizeHeaderName":45,"./utils":49,"_process":52}],38:[function(require,module,exports){
'use strict';

module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

},{}],39:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

},{"./../utils":49}],40:[function(require,module,exports){
'use strict';

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};

},{}],41:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);

},{"./../utils":49}],42:[function(require,module,exports){
'use strict';

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

},{}],43:[function(require,module,exports){
'use strict';

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};

},{}],44:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);

},{"./../utils":49}],45:[function(require,module,exports){
'use strict';

var utils = require('../utils');

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

},{"../utils":49}],46:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};

},{"./../utils":49}],47:[function(require,module,exports){
'use strict';

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

},{}],48:[function(require,module,exports){
'use strict';

var pkg = require('./../../package.json');

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};
var currentVerArr = pkg.version.split('.');

/**
 * Compare package versions
 * @param {string} version
 * @param {string?} thanVersion
 * @returns {boolean}
 */
function isOlderVersion(version, thanVersion) {
  var pkgVersionArr = thanVersion ? thanVersion.split('.') : currentVerArr;
  var destVer = version.split('.');
  for (var i = 0; i < 3; i++) {
    if (pkgVersionArr[i] > destVer[i]) {
      return true;
    } else if (pkgVersionArr[i] < destVer[i]) {
      return false;
    }
  }
  return false;
}

/**
 * Transitional option validator
 * @param {function|boolean?} validator
 * @param {string?} version
 * @param {string} message
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  var isDeprecated = version && isOlderVersion(version);

  function formatMessage(opt, desc) {
    return '[Axios v' + pkg.version + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed in ' + version));
    }

    if (isDeprecated && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  isOlderVersion: isOlderVersion,
  assertOptions: assertOptions,
  validators: validators
};

},{"./../../package.json":50}],49:[function(require,module,exports){
'use strict';

var bind = require('./helpers/bind');

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};

},{"./helpers/bind":38}],50:[function(require,module,exports){
module.exports={
  "_from": "axios@0.21.4",
  "_id": "axios@0.21.4",
  "_inBundle": false,
  "_integrity": "sha512-ut5vewkiu8jjGBdqpM44XxjuCjq9LAKeHVmoVfHVzy8eHgxxq8SbAVQNovDA8mVi05kP0Ea/n/UzcSHcTJQfNg==",
  "_location": "/axios",
  "_phantomChildren": {},
  "_requested": {
    "type": "version",
    "registry": true,
    "raw": "axios@0.21.4",
    "name": "axios",
    "escapedName": "axios",
    "rawSpec": "0.21.4",
    "saveSpec": null,
    "fetchSpec": "0.21.4"
  },
  "_requiredBy": [
    "#USER",
    "/"
  ],
  "_resolved": "https://registry.npmjs.org/axios/-/axios-0.21.4.tgz",
  "_shasum": "c67b90dc0568e5c1cf2b0b858c43ba28e2eda575",
  "_spec": "axios@0.21.4",
  "_where": "/Users/brenn/dev/sdk-javascript",
  "author": {
    "name": "Matt Zabriskie"
  },
  "browser": {
    "./lib/adapters/http.js": "./lib/adapters/xhr.js"
  },
  "bugs": {
    "url": "https://github.com/axios/axios/issues"
  },
  "bundleDependencies": false,
  "bundlesize": [
    {
      "path": "./dist/axios.min.js",
      "threshold": "5kB"
    }
  ],
  "dependencies": {
    "follow-redirects": "^1.14.0"
  },
  "deprecated": false,
  "description": "Promise based HTTP client for the browser and node.js",
  "devDependencies": {
    "coveralls": "^3.0.0",
    "es6-promise": "^4.2.4",
    "grunt": "^1.3.0",
    "grunt-banner": "^0.6.0",
    "grunt-cli": "^1.2.0",
    "grunt-contrib-clean": "^1.1.0",
    "grunt-contrib-watch": "^1.0.0",
    "grunt-eslint": "^23.0.0",
    "grunt-karma": "^4.0.0",
    "grunt-mocha-test": "^0.13.3",
    "grunt-ts": "^6.0.0-beta.19",
    "grunt-webpack": "^4.0.2",
    "istanbul-instrumenter-loader": "^1.0.0",
    "jasmine-core": "^2.4.1",
    "karma": "^6.3.2",
    "karma-chrome-launcher": "^3.1.0",
    "karma-firefox-launcher": "^2.1.0",
    "karma-jasmine": "^1.1.1",
    "karma-jasmine-ajax": "^0.1.13",
    "karma-safari-launcher": "^1.0.0",
    "karma-sauce-launcher": "^4.3.6",
    "karma-sinon": "^1.0.5",
    "karma-sourcemap-loader": "^0.3.8",
    "karma-webpack": "^4.0.2",
    "load-grunt-tasks": "^3.5.2",
    "minimist": "^1.2.0",
    "mocha": "^8.2.1",
    "sinon": "^4.5.0",
    "terser-webpack-plugin": "^4.2.3",
    "typescript": "^4.0.5",
    "url-search-params": "^0.10.0",
    "webpack": "^4.44.2",
    "webpack-dev-server": "^3.11.0"
  },
  "homepage": "https://axios-http.com",
  "jsdelivr": "dist/axios.min.js",
  "keywords": [
    "xhr",
    "http",
    "ajax",
    "promise",
    "node"
  ],
  "license": "MIT",
  "main": "index.js",
  "name": "axios",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/axios/axios.git"
  },
  "scripts": {
    "build": "NODE_ENV=production grunt build",
    "coveralls": "cat coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js",
    "examples": "node ./examples/server.js",
    "fix": "eslint --fix lib/**/*.js",
    "postversion": "git push && git push --tags",
    "preversion": "npm test",
    "start": "node ./sandbox/server.js",
    "test": "grunt test",
    "version": "npm run build && grunt version && git add -A dist && git add CHANGELOG.md bower.json package.json"
  },
  "typings": "./index.d.ts",
  "unpkg": "dist/axios.min.js",
  "version": "0.21.4"
}

},{}],51:[function(require,module,exports){
"use strict";function e(e){this.message=e}e.prototype=new Error,e.prototype.name="InvalidCharacterError";var r="undefined"!=typeof window&&window.atob&&window.atob.bind(window)||function(r){var t=String(r).replace(/=+$/,"");if(t.length%4==1)throw new e("'atob' failed: The string to be decoded is not correctly encoded.");for(var n,o,a=0,i=0,c="";o=t.charAt(i++);~o&&(n=a%4?64*n+o:o,a++%4)?c+=String.fromCharCode(255&n>>(-2*a&6)):0)o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(o);return c};function t(e){var t=e.replace(/-/g,"+").replace(/_/g,"/");switch(t.length%4){case 0:break;case 2:t+="==";break;case 3:t+="=";break;default:throw"Illegal base64url string!"}try{return function(e){return decodeURIComponent(r(e).replace(/(.)/g,(function(e,r){var t=r.charCodeAt(0).toString(16).toUpperCase();return t.length<2&&(t="0"+t),"%"+t})))}(t)}catch(e){return r(t)}}function n(e){this.message=e}function o(e,r){if("string"!=typeof e)throw new n("Invalid token specified");var o=!0===(r=r||{}).header?0:1;try{return JSON.parse(t(e.split(".")[o]))}catch(e){throw new n("Invalid token specified: "+e.message)}}n.prototype=new Error,n.prototype.name="InvalidTokenError";const a=o;a.default=o,a.InvalidTokenError=n,module.exports=a;


},{}],52:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[21]);
