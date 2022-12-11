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
//# sourceMappingURL=ChatClient.js.map