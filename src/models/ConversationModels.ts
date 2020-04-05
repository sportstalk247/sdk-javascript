import {Kind, ModerationType, User} from "./CommonModels";

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

export interface Commentary {
    conversation: Conversation,
    comments: Comment[]
}

export interface ConversationResponse extends Conversation {
    kind: Kind.conversation
    appid: string,
    commentcount: number
    open: boolean
}

export interface ReactionResponse {

}

export interface CommentDeletionResponse {}

export enum CommentSortMethod {
    oldest      = "oldest",
    newest      = "newest",
    mostreplies = "mostreplies",
    votes       = "votes"
}

export enum CommentSortDirection {
    forward     = "forward",
    backward    = "backward"
}
export interface CommentRequest {
    cursor?: string,
    sort?: CommentSortMethod | string,
    includechilden?: boolean
    direction?: CommentSortDirection
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

export interface Comment extends User {
    id?: string;
    body: string,
    replyto?: string
}

export interface ShortComment {
    body: string;
}