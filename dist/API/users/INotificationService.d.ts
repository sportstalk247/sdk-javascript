import { ISportsTalkConfigurable, IUserConfigurable } from "../Configuration";
import { User } from "../../models/user/User";
import { Notification, NotificationListRequest, NotificationListResult } from "../../models/user/Notifications";
export interface INotificationService extends ISportsTalkConfigurable, IUserConfigurable {
    listUserNotifications(request: NotificationListRequest): Promise<NotificationListResult>;
    setNotificationReadStatus(notificationid: string, userid: string, read?: boolean): Promise<Notification>;
    setNotificationReadStatusByChatEventId(chateventid: string, userid: string, read?: boolean): Promise<Notification>;
    deleteNotification(notificationid: string, userid: string): Promise<Notification>;
    deleteNotificationByChatEventId(chateventid: string, userid: string): Promise<Notification>;
    markAllNotificationsAsRead(user: User | string, deleteAll?: boolean): Promise<any>;
}
