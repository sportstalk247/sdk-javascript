/* istanbul ignore file */

import {ChatClientConfig, ClientConfig, SportsTalkConfig, UserTokenRefreshFunction} from "../models/CommonModels";
import {User} from "../models/user/User";

/**
 * @interface
 */
export interface ISportsTalkConfigurable {
    setConfig(config: SportsTalkConfig):void
}

/**
 *
 */
export interface IChatClientConfigurable {
    setConfig(config: ChatClientConfig): void
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
    setUser(user: User): void;
    getCurrentUser(): User | undefined | null;
    setUserToken(userToken: string): void;
    getUserToken(): Promise<string>;
    setUserTokenRefreshFunction(userRefreshFunction: UserTokenRefreshFunction): void;
    refreshUserToken(): Promise<string>;
}