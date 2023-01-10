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
        this.getConversationBatchDetails = function (conversations) {
            //@ts-ignore
            return _this._conversationService.getConversationBatchDetails(conversations);
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
//# sourceMappingURL=CommentClient.js.map