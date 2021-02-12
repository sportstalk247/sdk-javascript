import {
    ListRequest,
    NotificationListRequest, NotificationReadRequest,
    ReportType,
    RestApiResult,
    SportsTalkConfig,
    User,
    Notification,
    NotificationListResult,
    UserDeletionResponse,
    UserListResponse,
    UserModerationListRequest,
    UserResult,
    UserSearchType, DeleteNotificationRequest
} from "../models/CommonModels";
import {ISportsTalkConfigurable} from "../API/CommonAPI";
import {RestfulUserService} from "./REST/users/RestfulUserService";
import {DEFAULT_CONFIG} from "./constants/api";
import {IUserService} from "../API/Users";

/**
 * A class used for managing users.  Typically used by custom management dashboards.
 * @class
 */
export class UserClient implements ISportsTalkConfigurable, IUserService {

    // Configuration settings
    private _config: SportsTalkConfig = {appId: ""};

    private _userService: IUserService;

    public setConfig(config:SportsTalkConfig) {
        this._config = Object.assign(DEFAULT_CONFIG, config);
        this._userService = new RestfulUserService(this._config);
    }

    private constructor() {}

    public static init = (config:SportsTalkConfig) => {
        const client = new UserClient();
        client.setConfig(config);
        return client;
    }

    setBanStatus = (user: User | string, isBanned: boolean): Promise<UserResult> => {
        return this._userService.setBanStatus(user, isBanned);
    }

    setShadowBanStatus = (user: User | string, isShadowBanned: boolean, expiryseconds?: number): Promise<UserResult> => {
        return this._userService.setShadowBanStatus(user, isShadowBanned, expiryseconds);
    }

    createOrUpdateUser = (user: User): Promise<UserResult> => {
        return this._userService.createOrUpdateUser(user);
    }

    searchUsers = (search: string, type: UserSearchType, limit?:number): Promise<UserListResponse> => {
        return this._userService.searchUsers(search, type, limit);
    }

    listUsers = (request?: ListRequest): Promise<UserListResponse> => {
        return this._userService.listUsers(request);
    }
    deleteUser = (user:User | string):Promise<UserDeletionResponse> => {
        return this._userService.deleteUser(user);
    }

    getUserDetails = (user: User | string): Promise<UserResult> => {
        return this._userService.getUserDetails(user);
    }

    listUsersInModerationQueue = (request: UserModerationListRequest): Promise<any> => {
        return this._userService.listUsersInModerationQueue(request);
    }

    listUserNotifications = (request: NotificationListRequest): Promise<NotificationListResult> => {
        return this._userService.listUserNotifications(request)
    }

    setNotificationReadStatus = (notificationid: string, userid: string, read?:boolean):Promise<Notification> => {
        return this._userService.setNotificationReadStatus(notificationid, userid, read)
    }

    setNotificationReadStatusByChatEventId(chateventid: string, userid: string, read?: boolean): Promise<Notification> {
        return this._userService.setNotificationReadStatusByChatEventId(chateventid, userid, read);
    }

    reportUser = (userToReport: User | string, reportedBy: User | string, reportType: ReportType = ReportType.abuse): Promise<UserResult> => {
        return this._userService.reportUser(userToReport, reportedBy, reportType);
    }

    deleteNotification = (notificationid: string, userid: string): Promise<Notification> => {
        return this._userService.deleteNotification(notificationid, userid);
    }

    deleteNotificationByChatEventId = (chateventid: string, userid: string): Promise<Notification> => {
        return this._userService.deleteNotificationByChatEventId(chateventid, userid);
    }
}