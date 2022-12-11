"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.util = exports.Types = exports.Constants = exports.CommonModels = exports.CommentModels = exports.ChatModels = exports.impl = exports.Services = exports.UserClient = exports.CommentClient = exports.ChatClient = void 0;
var ChatClient_1 = require("./impl/ChatClient");
Object.defineProperty(exports, "ChatClient", { enumerable: true, get: function () { return ChatClient_1.ChatClient; } });
var CommentClient_1 = require("./impl/CommentClient");
Object.defineProperty(exports, "CommentClient", { enumerable: true, get: function () { return CommentClient_1.CommentClient; } });
var UserClient_1 = require("./impl/UserClient");
Object.defineProperty(exports, "UserClient", { enumerable: true, get: function () { return UserClient_1.UserClient; } });
var RestfulChatModerationService_1 = require("./impl/REST/chat/RestfulChatModerationService");
var RestfulChatEventService_1 = require("./impl/REST/chat/RestfulChatEventService");
var RestfulChatRoomService_1 = require("./impl/REST/chat/RestfulChatRoomService");
var RestfulUserService_1 = require("./impl/REST/users/RestfulUserService");
var ChatModels = require("./models/ChatModels");
exports.ChatModels = ChatModels;
var CommentModels = require("./models/CommentsModels");
exports.CommentModels = CommentModels;
var CommonModels = require("./models/CommonModels");
exports.CommonModels = CommonModels;
var Constants = require("./impl/constants/api");
exports.Constants = Constants;
var Messages = require("./impl/constants/messages");
var Errors = require("./impl/errors");
var RestfulConversationService_1 = require("./impl/REST/comments/RestfulConversationService");
var RestfulCommentModerationService_1 = require("./impl/REST/comments/RestfulCommentModerationService");
var RestfulCommentService_1 = require("./impl/REST/comments/RestfulCommentService");
var RestfulWebhookService_1 = require("./impl/REST/webhooks/RestfulWebhookService");
var util = require("./util");
exports.util = util;
var Chat = {
    RestfulChatModerationService: RestfulChatModerationService_1.RestfulChatModerationService,
    RestfulChatEventService: RestfulChatEventService_1.RestfulChatEventService,
    RestfulChatRoomService: RestfulChatRoomService_1.RestfulChatRoomService
};
var Comments = {
    RestfulConversationService: RestfulConversationService_1.RestfulConversationService,
    RestfulCommentService: RestfulCommentService_1.RestfulCommentService,
    RestfulCommentModerationService: RestfulCommentModerationService_1.RestfulCommentModerationService
};
var Users = {
    RestfulUserService: RestfulUserService_1.RestfulUserService,
};
var Webhooks = {
    RestfulWebhookService: RestfulWebhookService_1.RestfulWebhookService
};
var REST = {
    Chat: Chat,
    Comments: Comments,
    Users: Users,
    Webhooks: Webhooks
};
var Services = {
    ChatModerationService: RestfulChatModerationService_1.RestfulChatModerationService,
    ChatEventService: RestfulChatEventService_1.RestfulChatEventService,
    ChatRoomService: RestfulChatRoomService_1.RestfulChatRoomService,
    UserService: RestfulUserService_1.RestfulUserService,
    WebhookService: RestfulWebhookService_1.RestfulWebhookService,
    ConversationService: RestfulConversationService_1.RestfulConversationService,
    CommentService: RestfulCommentService_1.RestfulCommentService,
    CommentModerationService: RestfulCommentModerationService_1.RestfulCommentModerationService
};
exports.Services = Services;
var impl = {
    REST: REST
};
exports.impl = impl;
var Types = {
    Comments: CommentModels,
    Chat: ChatModels,
    Common: CommonModels,
    Errors: Errors,
    Messages: Messages,
};
exports.Types = Types;
//# sourceMappingURL=index.js.map