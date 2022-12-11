import { Comment, Conversation } from "../../../models/CommentsModels";
/**
 * Helper for finding the id of a comment
 * @param comment
 */
export declare function getUrlCommentId(comment: Comment | string): string;
/**
 * Helper for finding the id of a comments
 * @param conversation
 */
export declare function getUrlConversationId(conversation: Conversation | string): string;
