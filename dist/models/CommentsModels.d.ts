import { Kind, ListRequest, ListResponse } from "./CommonModels";
import { User } from "./user/User";
import { ModerationType, ReportReason } from "./Moderation";
import { EventReaction } from "./ChatModels";
export { Kind, ModerationType, User };
export interface HasConversationID {
    conversationid: string;
}
export interface CustomFields {
    customtags?: string[];
    customtype?: string;
    custompayload?: string;
    customfield1?: string;
    customfield2?: string;
}
export interface ConversationBatchListOptions {
    entities?: ('reactions' | 'likecount' | 'commentcount')[];
    cid?: string[];
}
export interface Conversation extends CustomFields {
    conversationid: string;
    customid?: string;
    property: string;
    moderation: ModerationType;
    owneruserid?: string;
    maxreports?: number;
    title?: string;
    added?: string;
    maxcommentlen?: number;
    enableprofanityfilter?: boolean;
    open?: boolean;
}
export interface CommentListResponse extends ListResponse {
    conversation: Conversation;
    comments: CommentResult[];
}
export interface CommentReplyList {
    kind: Kind.commentreplygrouplist;
    parentid: string;
    comments: CommentResult[];
}
export interface RepliesBatchResponse extends ListResponse {
    kind: Kind.repliesbyparentidlist;
    repliesgroupedbyparentid: CommentReplyList[];
}
export interface ConversationResponse extends Conversation {
    kind: Kind.conversation;
    appid: string;
    commentcount: number;
    open: boolean;
    reactions: Array<EventReaction>;
}
export declare enum CommentType {
    comment = "comment"
}
export interface CommentDeletionResponse {
    kind: Kind.deletedcomment;
    conversationid?: string;
    commentid: string;
    deletedComments: number;
}
export declare class CommentSortMethod {
    static oldest: "oldest";
    static newest: "newest";
    static mostreplies: "mostreplies";
    static votescroe: "votescore";
    static votes: "votes";
    static reaction(type: string): string;
}
export declare enum ListSortDirection {
    forward = "forward",
    backward = "backward"
}
export interface CommentRequest extends ListRequest {
    sort?: CommentSortMethod | string;
    includechildren?: boolean;
    includeinactive?: boolean;
    direction?: ListSortDirection;
}
export declare enum Vote {
    up = "up",
    down = "down",
    none = ""
}
export interface ConversationDeletionResponse extends HasConversationID {
    kind: Kind.deletedconversation;
    userid?: string;
    deletedConversations: number;
    deletedComments: number;
}
export interface ConversationDetailsListResponse extends ListResponse {
    kind: Kind.conversationdetailslist;
    conversations: Conversation[];
}
export declare enum CommentModeration {
    flagged = "flagged",
    rejected = "rejected",
    approved = "approved"
}
export interface SimpleComment {
    body: string;
    added?: string;
    replyto?: string;
}
export interface CommentResult extends FullComment {
    kind: Kind.comment;
    id: string;
}
export interface Comment extends CustomFields {
    kind?: Kind.comment;
    id?: string;
    conversationid?: string;
    body: string;
    appid?: string;
    replyto?: string;
    replycount?: number;
    reactions?: Array<any>;
    active?: boolean;
    parentid?: string;
    added?: string;
    modified?: number;
    deleted?: boolean;
    commenttype?: CommentType;
    votecount?: number;
    votescore?: number;
    moderation?: CommentModeration;
    votes?: Array<Vote>;
    reports?: Array<ReportReason>;
}
export interface FullComment extends Comment, User {
}
export interface ShortComment {
    body: string;
}
export interface CommentResponse extends Comment {
    kind: Kind.comment;
}
export interface ConversationRequest extends ListRequest {
    propertyid?: string;
}
export interface ConversationListResponse extends ListResponse {
    conversations: Conversation[];
}
