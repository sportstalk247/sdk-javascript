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

export interface User {
    userid: string,
    handle: string,
    handlelowercase?: string,
    displayname?: string,
    pictureurl?: string,
    profileurl?: string,
    banned?: boolean
}

export enum Kind {
    chat = "chat.event",
    room = "chat.room",
    user = "chat.user",
    api = "api.result",
    webhook = "chat.webhook",
    conversation = "comment.conversation",
    deletedconversation = "delete.conversation",
    comment = "comment.comment",
    deletedcomment ="delete.comment",
    deletedroom = "deleted.room",
    conversationlist = "list.commentconversations",
}

export interface UserResult extends User {
    kind?: Kind.user
}

export enum SearchType {
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
 * All API responses take the form of an ApiResult.  This includes ApiResult<null>.
 * For instance, the 200 response to a chat command is of the type ApiResult<null>
 */
export interface ApiResult<T> {
    kind: Kind.api,
    message: string, // "Success"
    errors: object,
    code: number,  //e.g. 200, 400
    data: [T]
}

export enum Reaction {
    like = 'like'
}

export enum ReportType {
    abuse = 'abuse'
}

export interface ReportReason {
    reporttype: ReportType,
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
}