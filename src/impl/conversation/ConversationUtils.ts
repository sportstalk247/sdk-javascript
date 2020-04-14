import {Comment, Conversation} from "../../models/ConversationModels";

export function getUrlCommentId(comment: Comment | string): string {
    // @ts-ignore
    const id = comment.id || comment;
    if(typeof id !== 'string') {
        return "";
    }
    return encodeURIComponent(id);
}


export function getUrlConversationId(conversation: Conversation | string): string {
    // @ts-ignore
    const id = conversation.conversationid || conversation;
    if(typeof id !== 'string') {
        return ""
    }
    return encodeURIComponent(id);
}