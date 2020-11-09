===============
Comment Objects
===============


export {
    Kind,
    ModerationType,
    User
}

export interface HasConversationID {
    conversationid: string,
}

export interface Conversation {
    conversationid: string,
    property: string,
    moderation: ModerationType,
    owneruserid?: string,
    maxreports? : number,
    title?: string,
    added?: string,
    maxcommentlen?: number,
    enableprofanityfilter?: boolean,
    open?: boolean
    customtags? : string[]
    customtype?: string,
    custompayload?: string
    customfield1?: string,
    customfield2?: string
}

export interface CommentListResponse extends ListResponse {
    conversation: Conversation,
    comments: CommentResponse[]
}

export interface CommentReplyList {
    kind: Kind.commentreplygrouplist,
    parentid: string,
    comments: CommentResponse[]
}
export interface RepliesBatchResponse extends ListResponse {
    kind: Kind.repliesbyparentidlist
    repliesgroupedbyparentid: CommentReplyList[]
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

export class CommentSortMethod {
    public static oldest: "oldest"
    public static newest: "newest"
    public static mostreplies: "mostreplies"
    public static votescroe: "votescore"
    public static votes: "votes"
    public static reaction(type:string) {return `reaction-${type}`}
}

export enum ListSortDirection {
    forward     = "forward",
    backward    = "backward"
}

export interface CommentRequest extends ListRequest {
    sort?: CommentSortMethod | string,
    includechildren?: boolean
    includeinactive?: boolean
    direction?: ListSortDirection
}

export enum Vote {
    up   = "up",
    down = "down",
    none = ""
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

export interface SimpleComment  {
    body: string,
    added?: string, // ISO 8601 timestamp, e.g. 2020-03-02T00:00:00Z
    replyto?: string
}

export interface CommentResponse extends Comment {
    id: string
}
export interface Comment extends User {
    kind?: Kind.comment
    id?: string;
    conversationid?: string
    body: string,
    appid?: string,
    replyto?: string
    replycount?: number,
    reactions?: Array<any>,
    active?: boolean,
    added?: string,
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
