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
//# sourceMappingURL=ConversationUtils.js.map