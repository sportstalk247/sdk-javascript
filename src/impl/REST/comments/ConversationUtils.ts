import {Comment, Conversation, HasConversationID} from "../../../models/CommentsModels";

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
export function getUrlConversationId(conversation: HasConversationID | string, key: string = 'conversationid'): string {
    // Honor the key (e.g. 'customid') — getConversationByCustomId passes 'customid', but
    // this previously ignored it and always read .conversationid, yielding "" for an
    // object that only had a customid.
    // @ts-ignore
    const id = (typeof conversation === 'string') ? conversation : (conversation[key] || conversation);
    if(typeof id !== 'string') {
        return ""
    }
    return encodeURIComponent(id);
}