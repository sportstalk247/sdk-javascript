import {Comment, Kind} from "../CommentsModels";
import {ListResponse, WebStatusCode, WebStatusString} from "../CommonModels";

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
    commentreply = 'commentreply',
    commentreaction = "commentreaction",
    commentconversationreaction = "commentconversationreaction",
}

export interface Webhook {
    id?: string,
    kind?: Kind.webhook,
    label: string,
    url: string,
    enabled: boolean,
    type: WebhookType,
    events: WebhookEvent[]
    requireallcustomtags?: string[]
}

export interface WebhookListResponse extends ListResponse {
    webhooks: Webhook[]
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