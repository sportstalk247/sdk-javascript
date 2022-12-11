import { ApiHeaders, SportsTalkConfig, UserTokenRefreshFunction } from "../models/CommonModels";
import { IUserConfigurable } from "../API/Configuration";
export declare function formify(data: any): string;
export declare function buildAPI(config: SportsTalkConfig, ext: string, request?: Object): string;
/**
 * Gets proper API headers with optional token.
 * Without the token, most requests do not require CORS, however you will need to provide a token injection proxy.
 * @param apiKey
 */
export declare function getUrlEncodedHeaders(apiKey?: string, userToken?: string): ApiHeaders;
export declare function getJSONHeaders(apiKey?: string, userToken?: string): ApiHeaders;
export declare function forceObjKeyOrString(obj: any, key?: string): string;
export declare class CallBackDelegate {
    _func: UserTokenRefreshFunction;
    _target: IUserConfigurable;
    constructor(target: IUserConfigurable, func: UserTokenRefreshFunction);
    callback: (jwt: string) => Promise<string>;
    setCallback: (func: UserTokenRefreshFunction) => void;
}
