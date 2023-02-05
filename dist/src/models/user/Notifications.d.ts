import { EventType } from "../ChatModels";
import { Kind, ListRequest, ListResponse } from "../CommonModels";
export interface Notification {
    kind: Kind.notification;
    id: string;
    added: string;
    userid: string;
    ts: number;
    whenread: string;
    isread: boolean;
    notificationtype: EventType;
    chatroomid?: string;
    chatroomcustomid?: string;
    commentconversationid?: string;
    commentconversationcustomid?: string;
    chateventid?: string;
    commentid?: string;
}
export interface NotificationListResult extends ListResponse {
    notifications: Notification[];
}
export interface NotificationRequest {
    userid: string;
}
export interface NotificationListRequest extends ListRequest, NotificationRequest {
    userid: string;
    includeread?: boolean;
    filterNotificationTypes?: EventType[];
}
export interface NotificationReadRequest extends NotificationRequest {
    userid: string;
    notificationid?: string;
    chateventid?: string;
    read?: boolean;
}
export interface DeleteNotificationRequest extends NotificationRequest {
    notificationid?: string;
    chateventid?: any;
}
