export enum ModerationType {
    pre = "pre",
    post = "post"
}

export interface ClientConfig {
    appId?: string,
    apiToken?: string,
    endpoint?: string,
}

export interface ApiHeaders {
    'Content-Type'?: string,
    'x-api-token'?: string
}

/**
 * A User is someone able to chat in chatrooms and make comments in conversations.
 * Users must be created before they can make comments or chat, and they must choice a chat room before they can participate.
 */
export interface User {
    userid: string, // Unique ID, defined by client application to use native IDs.
    handle: string, // Allowed Characters:  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_"
    handlelowercase?: string, // an all lowercase version of the handle
    displayname?: string, // A friendly display name.  E.g. a user has a handle "jjsmithyperson" and their display name "John J. Smith"
    pictureurl?: string, // a full URL to a profile photo.
    profileurl?: string, // a full URL to a profile url or personal webpage.
    banned?: boolean // Only set by the server.  If true the user is currently banned.
}

export enum Kind {
    chat = "chat.event",
    room = "chat.room",
    user = "app.user",
    api = "api.result",
    webhook = "chat.webhook",
    chatcommand = "chat.executecommand",
    conversation = "comment.conversation",
    deletedconversation = "delete.conversation",
    comment = "comment.comment",
    deletedcomment ="delete.comment",
    deletedroom = "deleted.room",
    deleteduser = "deleted.appuser",
    conversationlist = "list.commentconversations",
    chatlist = "list.chatevents",
    eventlist = "list.events",
    roomlist = "list.chatrooms",
    userlist = "list.users"
}

export interface UserResult extends User {
    kind?: Kind.user
}

/**
 * Used only for searching users by API.  A sear
 */
export enum UserSearchType {
    handle = 'handle',
    name = 'name',
    userid = 'userid'
}

/**
 * Used as an optional part of the constructor for a SportsTalk client.
 * Each property can also be set individually.
 */
export interface SportsTalkConfig extends ClientConfig {
    user?: User,
}

/**
 * General structure describing responses from the API server
 */
export interface MessageResult<T> {
    message: string, // "Success"
    errors: object,
    data: [T] | T
}
/**
 * All API responses take the form of an ApiResult.  This includes ApiResult<null>.
 */
export interface RestApiResult<T> extends MessageResult<T> {
    kind: Kind.api,
    code: number,  //e.g. 200, 400
}

export enum Reaction {
    like = 'like'
}

export enum ReportType {
    abuse = 'abuse'
}

export interface ReportReason {
    reporttype?: ReportType
    reason?: ReportType,
    userid: string
}

export enum WebhookType {
    prepublish = "prepublish",
    postpublish = "postpublish"
}

export enum WebhookEvent {
    chatspeech = "chatspeech",
    chatcustom = "chatcustom",
    chatreply = "chatreply",
    chatreaction = "chatreaction",
    chataction = "chataction",
    chatenter = "chatenter",
    chatexit = "chatexit",
    chatquote = "chatquote",
    chatroomopened = "chatroomopened",
    chatroomclosed = "chatroomclosed",
    chatpurge = "chatpurge",
    commentspeech = "commentspeech",
    commentreply = 'commentreply'
}

export interface WebHook {
    id?: string,
    kind?: Kind.webhook,
    label: string,
    url: string,
    enabled: boolean,
    type: WebhookType,
    events: WebhookEvent[]
}

export interface ListResponse {
    cursor?: string,
    more?: boolean
    itemcount?: number
}

export interface UserListResponse extends ListResponse {
    kind: Kind.userlist
    users: UserResult[]
}

export interface UserDeletionResponse {
    user: UserResult,
    kind: Kind.deleteduser
}

export interface WebhookListResponse extends ListResponse {
    webhooks: WebHook[]
}

export interface ListRequest {
    cursor?: string, // should be a cursor value supplied by API.
    limit?: number // must be an integer
}