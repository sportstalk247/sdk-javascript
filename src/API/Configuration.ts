/* istanbul ignore file */

import {ChatClientConfig, ClientConfig, SportsTalkConfig, User} from "../models/CommonModels";

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
}