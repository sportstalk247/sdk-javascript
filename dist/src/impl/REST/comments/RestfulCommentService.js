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
//# sourceMappingURL=RestfulCommentService.js.map