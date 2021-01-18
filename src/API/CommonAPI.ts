/* istanbul ignore file */

import {
    RestApiResult,
    ClientConfig,
    UserSearchType,
    SportsTalkConfig,
    User,
    UserResult,
    Webhook,
    ListRequest,
    UserListResponse,
    WebhookListResponse,
    UserDeletionResponse,
    UserModerationListRequest,
    NotificationListRequest
} from "../models/CommonModels";

/**
 * @interface
 */
export interface ISportsTalkConfigurable {
    setConfig(config: SportsTalkConfig):void
}

/**
 * @interface
 */
export interface IConfigurable {
    setConfig(config: ClientConfig): void
}

/**
 * @interface
 */
export interface IUserConfigurable {
    setUser(user: User):void;
    getUser(): User | undefined | null;
}

/**
 * @interface
 */
export interface IUserService extends ISportsTalkConfigurable {
    setBanStatus(user: User | string, isBanned: boolean): Promise<UserResult>
    setShadowBanStatus(user:User | String, isShadowBanned: boolean, expireseconds?: number): Promise<UserResult>
    createOrUpdateUser(user: User): Promise<UserResult>
    searchUsers(search: string, type: UserSearchType, limit?:number): Promise<UserListResponse>
    listUsers(request?: ListRequest): Promise<UserListResponse>
    deleteUser(user:User | string):Promise<UserDeletionResponse>
    getUserDetails(user: User | string): Promise<UserResult>
    listUsersInModerationQueue(request: UserModerationListRequest): Promise<any>
    listUserNotifications(request: NotificationListRequest): Promise<RestApiResult<any>>
}

/**
 * @interface
 */
export interface IWebhookService extends ISportsTalkConfigurable {
    listWebhooks(): Promise<WebhookListResponse>
    createWebhook(hook: Webhook): Promise<Webhook>;
    updateWebhook(hook: Webhook): Promise<Webhook>;
    deleteWebhook(hook: Webhook | string): Promise<Webhook>;
}