"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebStatusString = exports.WebStatusCode = exports.Reaction = exports.Kind = void 0;
var Kind;
(function (Kind) {
    Kind["chat"] = "chat.event";
    Kind["chatsubscription"] = "chat.subscription";
    Kind["roomusereffects"] = "chat.list.roomusereffects";
    Kind["room"] = "chat.room";
    Kind["userroomsubscriptions"] = "list.userroomsubscriptions";
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
//# sourceMappingURL=CommonModels.js.map