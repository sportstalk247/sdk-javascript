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
                url: utils_1.buildAPI(_this._config, "/chat/rooms/" + roomid + "/sessions/" + userid + "/touch"),
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
//# sourceMappingURL=RestfulChatEventService.js.map