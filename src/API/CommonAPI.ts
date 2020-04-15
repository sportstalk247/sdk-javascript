/* istanbul ignore file */

import {RestApiResult, ClientConfig, SearchType, SportsTalkConfig, User, UserResult, WebHook} from "../models/CommonModels";

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
    searchUsers(search: string, type: SearchType, limit?:number): Promise<Array<UserResult>>
}

export interface IWebhookService extends ISportsTalkConfigurable {
    listWebhooks(): Promise<WebHook[]>;
    createWebhook(hook: WebHook): Promise<WebHook>;
    updateWebhook(hook: WebHook): Promise<WebHook>;
    deleteWebhook(hook: WebHook | string): Promise<WebHook>;
}