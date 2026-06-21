import {EventType} from "../ChatModels";
import {Kind, ListRequest, ListResponse} from "../CommonModels";
import {WebhookEvent} from "../webhooks/Webhooks";

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

export interface NotificationListResult extends ListResponse {
    notifications: Notification[]
}

export interface NotificationRequest {
    userid: string,
}

export interface NotificationListRequest extends ListRequest, NotificationRequest {
    userid: string,
    includeread?: boolean,
    // Notification filter tokens use the WebhookEvent vocabulary (chatreply, chatquote,
    // chatreaction, ...), not the chat EventType enum.
    filterNotificationTypes?: WebhookEvent[]
}

export interface NotificationReadRequest extends NotificationRequest {
    userid: string,
    notificationid?: string
    chateventid?: string
    read?: boolean
}

export interface DeleteNotificationRequest extends NotificationRequest {
    notificationid?: string
    chateventid?
}