/* istanbul ignore file */

import {
    RestApiResult,
    ClientConfig,
    UserSearchType,
    SportsTalkConfig,
    User,
    UserResult,
    WebHook,
    ListRequest, UserListResponse, WebhookListResponse
} from "../models/CommonModels";

export interface ISportsTalkConfigurable {
    setConfig(config: SportsTalkConfig)
}

export interface IConfigurable {
    setConfig(config: ClientConfig)
}

export interface IUserConfigurable {
    setUser(user: User);
    getUser(): User | undefined | null;
}

export interface IUserService extends ISportsTalkConfigurable {
    setBanStatus(user: User | string, isBanned: boolean): Promise<RestApiResult<UserResult>>
    createOrUpdateUser(user: User): Promise<UserResult>
    searchUsers(search: string, type: UserSearchType, limit?:number): Promise<UserListResponse>
    listUsers(request?: ListRequest): Promise<UserListResponse>
    getUserDetails(user: User | string): Promise<UserResult>
}

export interface IWebhookService extends ISportsTalkConfigurable {
    listWebhooks(): Promise<WebhookListResponse>
    createWebhook(hook: WebHook): Promise<WebHook>;
    updateWebhook(hook: WebHook): Promise<WebHook>;
    deleteWebhook(hook: WebHook | string): Promise<WebHook>;
}