import { User } from "./user/User";
export interface ClientConfig {
    appId?: string;
    apiToken?: string;
    endpoint?: string;
}
export interface UserTokenRefreshFunction {
    (token: string): Promise<string>;
}
export interface ApiHeaders {
    'Content-Type'?: string;
    'x-api-token'?: string;
}
export declare enum Kind {
    chat = "chat.event",
    chatsubscription = "chat.subscription",
    roomusereffects = "chat.list.roomusereffects",
    room = "chat.room",
    userroomsubscriptions = "list.userroomsubscriptions",
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
    deletedcomment = "delete.comment",
    deletedroom = "deleted.room",
    deleteduser = "deleted.appuser",
    conversationlist = "list.commentconversations",
    chatlist = "list.chatevents",
    eventlist = "list.events",
    roomlist = "list.chatrooms",
    userlist = "list.users",
    repliesbyparentidlist = "list.repliesbyparentid",
    commentreplygrouplist = "list.commentreplygroup",
    chatroomextendeddetails = "chat.room.list.extendeddetails"
}
/**
 * Used as an optional part of the constructor for a SportsTalk client.
 * Each property can also be set individually.
 */
export interface SportsTalkConfig extends ClientConfig {
    user?: User;
    userToken?: string;
    userTokenRefreshFunction?: UserTokenRefreshFunction;
}
export interface ChatClientConfig extends SportsTalkConfig {
    smoothEventUpdates?: boolean;
    maxEventBufferSize?: number;
    chatEventPollFrequency?: number;
    updateEmitFrequency?: number;
}
/**
 * General structure describing responses from the API server
 */
export interface MessageResult<T> {
    message: string;
    errors: object;
    data: T;
}
/**
 * All API responses take the form of an ApiResult.  This includes ApiResult<null>.
 */
export interface RestApiResult<T> extends MessageResult<T> {
    kind: Kind.api;
    code: number;
}
export interface ErrorResult extends MessageResult<null> {
    data: null;
}
export declare enum Reaction {
    like = "like"
}
export interface ListResponse {
    cursor?: string;
    more?: boolean;
    itemcount?: number;
}
export interface ISO8601DATE {
}
export declare enum WebStatusCode {
    OK = 200,
    NOT_FOUND = 404,
    SERVER_ERROR = 500
}
export declare enum WebStatusString {
    OK = "OK"
}
export interface ListRequest {
    cursor?: string;
    limit?: number;
}
