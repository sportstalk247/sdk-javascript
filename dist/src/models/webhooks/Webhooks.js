"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookEvent = exports.WebhookType = void 0;
var WebhookType;
(function (WebhookType) {
    WebhookType["prepublish"] = "prepublish";
    WebhookType["postpublish"] = "postpublish";
})(WebhookType = exports.WebhookType || (exports.WebhookType = {}));
var WebhookEvent;
(function (WebhookEvent) {
    WebhookEvent["chatspeech"] = "chatspeech";
    WebhookEvent["chatcustom"] = "chatcustom";
    WebhookEvent["chatreply"] = "chatreply";
    WebhookEvent["chatreaction"] = "chatreaction";
    WebhookEvent["chataction"] = "chataction";
    WebhookEvent["chatenter"] = "chatenter";
    WebhookEvent["chatexit"] = "chatexit";
    WebhookEvent["chatquote"] = "chatquote";
    WebhookEvent["chatroomopened"] = "chatroomopened";
    WebhookEvent["chatroomclosed"] = "chatroomclosed";
    WebhookEvent["chatpurge"] = "chatpurge";
    WebhookEvent["commentspeech"] = "commentspeech";
    WebhookEvent["commentreply"] = "commentreply";
})(WebhookEvent = exports.WebhookEvent || (exports.WebhookEvent = {}));
//# sourceMappingURL=Webhooks.js.map