import {Comment, Conversation} from "../../models/ConversationModels";

export function getUrlCommentId(comment: Comment | string): string {
    // @ts-ignore
    return encodeURI(comment.id || comment);
}


export function getUrlConversationId(conversation: Conversation | string): string {
    // @ts-ignore
    return encodeURI(conversation.conversationid || conversation);
}