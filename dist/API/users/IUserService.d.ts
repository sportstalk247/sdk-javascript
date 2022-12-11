import { ISportsTalkConfigurable } from "../Configuration";
import { ListRequest } from "../../models/CommonModels";
import { User, UserDeletionResponse, UserListResponse, UserModerationListRequest, UserResult, UserSearchType } from "../../models/user/User";
import { ReportType } from "../../models/Moderation";
/**
 * @interface
 */
export interface IUserService extends ISportsTalkConfigurable {
    setBanStatus(user: User | string, isBanned: boolean): Promise<UserResult>;
    setShadowBanStatus(user: User | String, isShadowBanned: boolean, expireseconds?: number): Promise<UserResult>;
    createOrUpdateUser(user: User): Promise<UserResult>;
    searchUsers(search: string, type: UserSearchType, limit?: number): Promise<UserListResponse>;
    listUsers(request?: ListRequest): Promise<UserListResponse>;
    deleteUser(user: User | string): Promise<UserDeletionResponse>;
    getUserDetails(user: User | string): Promise<UserResult>;
    reportUser(userToReport: User | string, reportedBy: User | string, reportType?: ReportType): Promise<UserResult>;
    listUsersInModerationQueue(request: UserModerationListRequest): Promise<UserListResponse>;
}
