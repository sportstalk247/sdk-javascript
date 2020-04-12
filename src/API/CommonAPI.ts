import {ApiResult, ClientConfig, SearchType, SportsTalkConfig, User, UserResult} from "../models/CommonModels";
import {Promise} from "es6-promise";
import {ChatWebHook, EventResult} from "../models/ChatModels";

export interface ISportsTalkConfigurable {
    setConfig(config: SportsTalkConfig)
}

export interface IConfigurable {
    setConfig(config: ClientConfig)
}

export interface IUserConfigurable {
    setUser(user: User)
}

export interface IUserManager extends ISportsTalkConfigurable {
    setBanStatus(user: User | string, isBanned: boolean): Promise<ApiResult<UserResult>>
    createOrUpdateUser(user: User): Promise<UserResult>
    searchUsers(search: string, type: SearchType, limit?:number): Promise<Array<UserResult>>
}

export interface IWebhookManager extends ISportsTalkConfigurable {
    listWebhooks(): Promise<ChatWebHook[]>;
    createWebhook(hook: ChatWebHook): Promise<ChatWebHook>;
    updateWebhook(hook: ChatWebHook): Promise<ChatWebHook>;
    deleteWebhook(hook: ChatWebHook | string): Promise<ChatWebHook>;
}