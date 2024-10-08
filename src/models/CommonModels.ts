import {User} from "./user/User";
import { AxiosHeaderValue} from "axios";
export interface ClientConfig {
    appId?: string,
    apiToken?: string,
    endpoint?: string,
}
export interface UserTokenRefreshFunction {
    (token:string): Promise<string>
}

export interface ApiHeaders {
    'Content-Type'?: AxiosHeaderValue,
    'x-api-token'?: AxiosHeaderValue
}

export enum Kind {
    chat = "chat.event",
    chatsubscription = "chat.subscription",
    roomusereffects = "chat.list.roomusereffects",
    room = "chat.room",
    userroomsubscriptions = "chat.list.userroomsubscriptions",
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
    commentreplygrouplist = "list.commentreplygroup",
    chatroomextendeddetails = "chat.room.list.extendeddetails",
    conversationdetailslist = "list.comment.conversation.details",
}

/**
 * Used as an optional part of the constructor for a SportsTalk client.
 * Each property can also be set individually.
 */
export interface SportsTalkConfig extends ClientConfig {
    user?: User,
    userToken?: string
    userTokenRefreshFunction?: UserTokenRefreshFunction,
}

export interface ChatClientConfig extends SportsTalkConfig {
    smoothEventUpdates?: boolean
    maxEventBufferSize?: number
    chatEventPollFrequency?: number
    updateEmitFrequency?: number
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

export interface MayHaveCustomId {
    customid?: string
}

export interface HasCustomId {
    customid: string
}

export interface MayHaveCustomType {
    customtype?:string
}

export interface MayHaveCustomPayload {
    custompayload?:object,
}
export interface MayHaveCustomTags {
    customtags?: Array<string>
}

export interface MayHaveCustomFields {
    customfield1?:string,
    customfield2?:string
}

export interface ErrorResult extends MessageResult<null>{
    data: null
}

export enum Reaction {
    like = 'like'
}

export interface ListResponse {
    cursor?: string,
    more?: boolean
    itemcount?: number
}

export interface ReactionCommand {
    reaction: Reaction | string,
    reacted: boolean
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

export interface ListRequest {
    cursor?: string, // should be a cursor value supplied by API.
    limit?: number // must be an integer
}

