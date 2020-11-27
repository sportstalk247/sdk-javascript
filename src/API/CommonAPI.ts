/* istanbul ignore file */

import {
    RestApiResult,
    ClientConfig,
    UserSearchType,
    SportsTalkConfig,
    User,
    UserResult,
    Webhook,
    ListRequest, UserListResponse, WebhookListResponse, UserDeletionResponse
} from "../models/CommonModels";

export interface ISportsTalkConfigurable {
    setConfig(config: SportsTalkConfig):void
}

export interface IConfigurable {
    setConfig(config: ClientConfig): void
}

export interface IUserConfigurable {
    setUser(user: User):void;
    getUser(): User | undefined | null;
}

export interface IUserService extends ISportsTalkConfigurable {
    setBanStatus(user: User | string, isBanned: boolean): Promise<RestApiResult<UserResult>>
    setShadowBanStatus(user: User | string, isShadowBanned: boolean, expiryseconds?: number): Promise<RestApiResult<UserResult>>
    createOrUpdateUser(user: User): Promise<UserResult>
    searchUsers(search: string, type: UserSearchType, limit?:number): Promise<UserListResponse>
    listUsers(request?: ListRequest): Promise<UserListResponse>
    deleteUser(user:User | string):Promise<UserDeletionResponse>
    getUserDetails(user: User | string): Promise<UserResult>
}

export interface IWebhookService extends ISportsTalkConfigurable {
    listWebhooks(): Promise<WebhookListResponse>
    createWebhook(hook: Webhook): Promise<Webhook>;
    updateWebhook(hook: Webhook): Promise<Webhook>;
    deleteWebhook(hook: Webhook | string): Promise<Webhook>;
}