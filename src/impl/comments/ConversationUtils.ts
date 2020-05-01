import {Comment, Conversation} from "../../models/CommentsModels";

/**
 * Helper for finding the id of a comment
 * @param comment
 */
export function getUrlCommentId(comment: Comment | string): string {
    // @ts-ignore
    const id = comment.id || comment;
    if(typeof id !== 'string') {
        return "";
    }
    return encodeURIComponent(id);
}

/**
 * Helper for finding the id of a comments
 * @param conversation
 */
export function getUrlConversationId(conversation: Conversation | string): string {
    // @ts-ignore
    const id = conversation.conversationid || conversation;
    if(typeof id !== 'string') {
        return ""
    }
    return encodeURIComponent(id);
}