import { ListRequest, SportsTalkConfig, UserTokenRefreshFunction } from "../models/CommonModels";
import { ISportsTalkConfigurable } from "../API/Configuration";
import { IUserService } from "../API/users/IUserService";
import { User, UserDeletionResponse, UserListResponse, UserModerationListRequest, UserResult, UserSearchType } from "../models/user/User";
import { ReportType } from "../models/Moderation";
import { UserSubscriptionListResponse } from "../models/chat/ChatRoom";
/**
 * A class used for managing users.  Typically used by custom management dashboards.
 * @class
 */
export declare class UserClient implements ISportsTalkConfigurable, IUserService {
    private _config;
    private _userService;
    setConfig(config: SportsTalkConfig): void;
    /**
     * Sets the user's JWT access token
     * @param userToken
     */
    setUserToken: (userToken: string) => void;
    /**
     * Sets a refreshFunction for the user's JWT token.
     * @param refreshFunction
     */
    setUserTokenRefreshFunction: (refreshFunction: UserTokenRefreshFunction) => void;
    private constructor();
    static init: (config?: SportsTalkConfig | undefined) => UserClient;
    setBanStatus: (user: User | string, isBanned: boolean) => Promise<UserResult>;
    listUserSubscribedRooms: (user: User | string, cursor?: any) => Promise<UserSubscriptionListResponse>;
    setShadowBanStatus: (user: User | string, isShadowBanned: boolean, expiryseconds?: number | undefined) => Promise<UserResult>;
    createOrUpdateUser: (user: User) => Promise<UserResult>;
    searchUsers: (search: string, type: UserSearchType, limit?: number | undefined) => Promise<UserListResponse>;
    listUsers: (request?: ListRequest | undefined) => Promise<UserListResponse>;
    deleteUser: (user: User | string) => Promise<UserDeletionResponse>;
    getUserDetails: (user: User | string) => Promise<UserResult>;
    listUsersInModerationQueue: (request: UserModerationListRequest) => Promise<any>;
    reportUser: (userToReport: User | string, reportedBy: User | string, reportType?: ReportType) => Promise<UserResult>;
}
