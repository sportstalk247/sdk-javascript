import { SportsTalkConfig, UserTokenRefreshFunction } from "../../../models/CommonModels";
import { INotificationService } from "../../../API/users/INotificationService";
import { UserResult, User } from "../../../models/user/User";
import { Notification, NotificationListRequest, NotificationListResult } from "../../../models/user/Notifications";
export declare class RestfulNotificationService implements INotificationService {
    private _config;
    private _jsonHeaders;
    private _user;
    private _tokenExpiry;
    constructor(config: SportsTalkConfig);
    getTokenExp(): number | void;
    setUser(user: User): void;
    getCurrentUser: () => any;
    setUserToken: (token: string) => void;
    getUserToken: () => Promise<string>;
    refreshUserToken: () => Promise<string>;
    /**
     * Sets the config
     * @param config
     */
    setConfig: (config: SportsTalkConfig) => void;
    /**
     * Sets a refreshFunction for the user's JWT token.
     * @param refreshFunction
     */
    setUserTokenRefreshFunction: (refreshFunction: UserTokenRefreshFunction) => void;
    listUserNotifications: (request: NotificationListRequest) => Promise<NotificationListResult>;
    setNotificationReadStatus: (notificationid: string, userid: string, read?: boolean) => Promise<Notification>;
    private _validateNotificationRequest;
    setNotificationReadStatusByChatEventId: (chateventid: string, userid: string, read?: boolean) => Promise<Notification>;
    markAllNotificationsAsRead: (user: UserResult | string, deleteAll?: boolean) => any;
    deleteNotification: (notificationid: string, userid: string) => Promise<Notification>;
    deleteNotificationByChatEventId: (chateventid: string, userid: string) => Promise<Notification>;
}
