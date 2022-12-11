import { ListRequest, UserTokenRefreshFunction, SportsTalkConfig } from "../../../models/CommonModels";
import { IUserService } from "../../../API/users/IUserService";
import { User, UserDeletionResponse, UserListResponse, UserModerationListRequest, UserResult, UserSearchType } from "../../../models/user/User";
import { ReportType } from "../../../models/Moderation";
/**
 * Class for handling user management via REST.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
export declare class RestfulUserService implements IUserService {
    private _config;
    private _jsonHeaders;
    private _apiExt;
    constructor(config: SportsTalkConfig);
    /**
     * Sets the config
     * @param config
     */
    setConfig: (config: SportsTalkConfig) => void;
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
    /**
     * User Management
     */
    /**
     * If the user exists, updates the user. Otherwise creates a new user.
     * @return user a User
     * @param user a User model.  The values of 'banned', 'handlelowercase' and 'kind' are ignored.
     */
    createOrUpdateUser: (user: User) => Promise<UserResult>;
    /**
     * Bans or unbans a user.  If isBanned = true the user will be banned (global).  This same command with isBanned = false will unban them.
     * @param user || userid
     * @param isBanned
     */
    setBanStatus: (user: User | string, isBanned: boolean, expireseconds?: number | undefined) => Promise<UserResult>;
    /**
     * Shadowbans (Mutes) a user.  A shadowbanned user's messages will be ignored by the **ChatClient** unless the userid matches the sender.
     *
     * @param user
     * @param isShadowBanned
     * @param expireseconds
     */
    setShadowBanStatus: (user: User | String, isShadowBanned: boolean, expireseconds?: number | undefined) => Promise<UserResult>;
    /**
     * Search users for this application
     * @param search
     * @param type
     */
    searchUsers: (search: string, type: UserSearchType) => Promise<UserListResponse>;
    /**
     * Delete a user
     * @param user
     */
    deleteUser: (user: User | string) => Promise<UserDeletionResponse>;
    /**
     * Returns a list of users.  You can provide a ListRequest object to customize the query.
     * @param request a ListRequest
     */
    listUsers: (request?: ListRequest | undefined) => Promise<UserListResponse>;
    /**
     * Returns a user.
     * @param user either a UserResult or a string representing a userid.  Typically used when you only have the userid.
     */
    getUserDetails: (user: User | string) => Promise<UserResult>;
    reportUser: (userToReport: User | string, reportedBy: User | string, reportType?: ReportType) => Promise<UserResult>;
    listUsersInModerationQueue: (request: UserModerationListRequest) => Promise<UserListResponse>;
}
