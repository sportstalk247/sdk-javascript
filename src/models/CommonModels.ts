import {EventType} from "./ChatModels";
import {Comment} from './CommentsModels';

export enum ModerationType {
    pre = "pre",
    post = "post"
}

export const UserModerationState = {
    Flagged: 'flagged',
    Approved: 'approved',
    Rejected: 'rejected'
} as const;

export interface ClientConfig {
    appId?: string,
    apiToken?: string,
    endpoint?: string,
}

export interface ApiHeaders {
    'Content-Type'?: string,
    'x-api-token'?: string
}

export enum UserRole {
    admin="admin",
    moderator="moderator",
    user="user"
}

/**
 * A User is someone able to chat in chatrooms and make comments in conversations.
 * Users must be created before they can make comments or chat, and they must choice a chat room before they can participate.
 */
export interface User {
    userid: string, // Unique ID, defined by client application to use native IDs.
    handle?: string, // Allowed Characters:  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_"
    handlelowercase?: string, // an all lowercase version of the handle
    displayname?: string, // A friendly display name.  E.g. a user has a handle "jjsmithyperson" and their display name "John J. Smith"
    pictureurl?: string, // a full URL to a profile photo.
    profileurl?: string, // a full URL to a profile url or personal webpage.
    banned?: boolean, // Only set by the server.  If true the user is currently banned.
    shadowbanned?: boolean // Set by server when admin mutes/shadowbans a user.
    role?: UserRole,
    customtags?: string[],
    shadowbanexpires?: string | null | undefined // Set by server to non-null value when the shadowban expires. Expiry date/time in ISO8601, e.g. 2020-11-11T14:29:04.5149528Z
}

export enum Kind {
    chat = "chat.event",
    room = "chat.room",
    notification = "notification",
    bounce = "chat.bounceuser",
    user = "app.user",
    api = "api.result",
    webhook = "webhook.webhook",
    webhookevent = "webhook.event",
    webhooklogs = "list.webhook.logentries",
    webhookcommentpayload = "webhook.payload.comment",
    webhookcommentreplypayload = "webhook.payload.commentreply",
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
    userlist = "list.users",
    repliesbyparentidlist = "list.repliesbyparentid",
    commentreplygrouplist = "list.commentreplygroup"
}

export interface UserResult extends User {
    kind?: Kind.user
    reports: []
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
    improvePerceivedPerformance?: boolean
    chatEventPollFrequency?: number
}

/**
 * General structure describing responses from the API server
 */
export interface MessageResult<T> {
    message: string, // "Success"
    errors: object,
    data: T
}
/**
 * All API responses take the form of an ApiResult.  This includes ApiResult<null>.
 */
export interface RestApiResult<T> extends MessageResult<T> {
    kind: Kind.api,
    code: number,  //e.g. 200, 400
}


export interface ErrorResult extends MessageResult<null>{
    data: null
}

export enum Reaction {
    like = 'like'
}

export enum ReportType {
    abuse = 'abuse',
    spam = "spam",
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

export interface Webhook {
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
    webhooks: Webhook[]
}

export interface ISO8601DATE {

}

export enum WebStatusCode {
    OK = 200,
    NOT_FOUND = 404,
    SERVER_ERROR= 500
}

export enum WebStatusString {
    OK = "OK",
}

export interface WebhookPayload {
    "kind": Kind.webhookcommentpayload,
    "appid": string,
}

export interface WebhookCommentPayload extends WebhookPayload {
    conversationid: string,
    commentid: string
    comment: Comment
}

export interface WebhookLog {
    id: string,
    appid: string,
    added: string,
    ellapsedtimems: number,
    type: WebhookType,
    eventtype: WebhookEvent, // Move to common models
    webhook: Webhook,
    completedrequest: boolean,
    statuscode: WebStatusCode,
    status: WebStatusString,
    payload: Comment
}

export interface WebhookLogResponse extends ListResponse {
    logentries: Array<WebhookLog>
}

export interface ListRequest {
    cursor?: string, // should be a cursor value supplied by API.
    limit?: number // must be an integer
}

export interface ChatModerationQueueListRequest extends ListRequest {
    roomId?: string // RoomID to restrict items expecting moderation.
}

export interface UserModerationListRequest extends ListRequest {
    filterHandle?: string,
    filterUserId?: string,
    filterChatRoomId?: string,
    filterChatRoomCustomId: string,
    filterModerationState?: typeof UserModerationState
}

export interface Notification {
    kind: Kind.notification,
    id: string
    added: string, //ISO 8601
    userid: string
    ts: number,
    whenread: string // ISO 8601
    isread: boolean,
    notificationtype: EventType
    chatroomid?: string,
    chatroomcustomid?: string
    commentconversationid?: string
    commentconversationcustomid?: string
    chateventid?: string
    commentid?: string
}

export interface NotificationListResult extends ListResponse{
    notifications: Notification[]
}

export interface NotificationRequest {
    userid: string,
}

export interface NotificationListRequest extends ListRequest, NotificationRequest {
    userid: string,
    includeread?: boolean,
    filterNotificationTypes?: EventType[]
}

export interface NotificationReadRequest extends NotificationRequest{
    userid: string,
    notificationid?: string
    eventid?: string
    read?: boolean
}

export interface DeleteNotificationRequest extends NotificationRequest {
    notificationid?: string
    eventid?
}
