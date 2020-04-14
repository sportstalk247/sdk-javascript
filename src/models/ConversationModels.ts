import {Kind, ListResponse, ModerationType, ReportReason, User} from "./CommonModels";

export {
    Kind,
    ModerationType,
    User
}

export interface HasConversationID {
    conversationid: string,
}

export interface Conversation extends HasConversationID {
    owneruserid?: string,
    conversationid: string,
    property: string,
    moderation: ModerationType,
    maxreports? : number,
    title?: string,
    maxcommentlen?: number,
    conversationisopen?: boolean
    tags? : string[]
    udf1?: string,
    udf2?: string
}

export interface CommentListResponse extends ListResponse {
    conversation: Conversation,
    comments: Comment[]
}

export interface ConversationResponse extends Conversation {
    kind: Kind.conversation
    appid: string,
    commentcount: number
    open: boolean
}


export enum CommentType {
    comment = "comment"
}

export interface CommentDeletionResponse {
    kind: Kind.deletedcomment,
    conversationid?: string,
    commentid: string,
    deletedComments: number
}

export enum CommentSortMethod {
    oldest      = "oldest",
    newest      = "newest",
    mostreplies = "mostreplies",
    votes       = "votes"
}

export enum ListSortDirection {
    forward     = "forward",
    backward    = "backward"
}

export interface ListRequest {
    cursor?: string,
    limit?: number
}
export interface CommentRequest extends ListRequest{
    sort?: CommentSortMethod | string,
    includechilden?: boolean
    direction?: ListSortDirection
}

export enum Vote {
    up   = "up",
    down = "down",
    none = "none"
}

export interface ConversationDeletionResponse extends HasConversationID {
    kind: Kind.deletedconversation,
    conversationid: string,
    userid?: string,
    deletedConversations: number,
    deletedComments: number
}

export enum CommentModeration {
    flagged = "flagged",
    rejected = "rejected",
    approved = "approved"
}

export interface Comment extends User {
    id: string;
    conversationid?: string
    body: string,
    appid?: string,
    replyto?: string
    replycount?: number,
    reactions?: Array<any>,
    active?: boolean,
    added?: number,
    modified?: number,
    deleted?: boolean,
    commenttype?: CommentType,
    votecount?: number,
    votescore?: number,
    moderation?: CommentModeration,
    votes?: Array<Vote>,
    reports?: Array<ReportReason>
}

export interface ShortComment {
    body: string;
}

export interface CommentResponse extends Comment {
    kind: Kind.comment
}

export interface ConversationRequest extends ListRequest {
    propertyid?: string,
}

export interface ConversationListResponse extends ListResponse{
    conversations: Conversation[]
}