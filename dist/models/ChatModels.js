"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventModerationState = exports.ChatOptionsEventType = exports.CustomEventTypes = exports.EventType = void 0;
var EventType;
(function (EventType) {
    EventType["speech"] = "speech";
    EventType["purge"] = "purge";
    EventType["mute"] = "mute";
    EventType["banned"] = "banned";
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
//# sourceMappingURL=ChatModels.js.map