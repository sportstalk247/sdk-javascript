import {
    ListRequest,
    SportsTalkConfig,
    UserTokenRefreshFunction
} from "../models/CommonModels";
import {ISportsTalkConfigurable} from "../API/Configuration";
import {RestfulUserService} from "./REST/users/RestfulUserService";
import {DEFAULT_CONFIG} from "./constants/api";
import {IUserService} from "../API/users/IUserService";
import {
    User,
    UserDeletionResponse,
    UserListResponse,
    UserModerationListRequest,
    UserResult,
    UserSearchType
} from "../models/user/User";
import {DeleteNotificationRequest} from "../models/user/Notifications";
import {ReportType} from "../models/Moderation";
import {UserSubscriptionListResponse} from "../models/chat/ChatRoom";

/**
 * A class used for managing users.  Typically used by custom management dashboards.
 * @class
 */
export class UserClient implements ISportsTalkConfigurable, IUserService {

    // Configuration settings
    private _config: SportsTalkConfig = {appId: ""};

    private _userService: IUserService;

    public setConfig(config:SportsTalkConfig) {
        this._config = Object.assign({}, DEFAULT_CONFIG, config);
        this._userService = new RestfulUserService(this._config);
    }

    /**
     * Sets the user's JWT access token
     * @param userToken
     */
    public setUserToken = (userToken:string) => {
        this._config.userToken = userToken;
        this.setConfig(this._config);
    }

    /**
     * Sets a refreshFunction for the user's JWT token.
     * @param refreshFunction
     */
    public setUserTokenRefreshFunction = (refreshFunction: UserTokenRefreshFunction) => {
        this._config.userTokenRefreshFunction = refreshFunction;
        this.setConfig(this._config);
    }

    private constructor() {}

    public static init = (config?:SportsTalkConfig) => {
        const client = new UserClient();
        if(config) {
            client.setConfig(config);
        }
        return client;
    }

    setBanStatus = (user: User | string, isBanned: boolean): Promise<UserResult> => {
        return this._userService.setBanStatus(user, isBanned);
    }

    listUserSubscribedRooms = (user: User | string, cursor?): Promise<UserSubscriptionListResponse> => {
        return this._userService.listUserSubscribedRooms(user, cursor);
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

    reportUser = (userToReport: User | string, reportedBy: User | string, reportType: ReportType = ReportType.abuse): Promise<UserResult> => {
        return this._userService.reportUser(userToReport, reportedBy, reportType);
    }
}