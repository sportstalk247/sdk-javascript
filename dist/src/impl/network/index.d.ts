import { AxiosRequestConfig } from "axios";
import { IUserConfigurable, NetworkRequestOptions } from '../../API/Configuration';
export interface NetworkRequest {
    (config: AxiosRequestConfig, errorHandlerfunction?: ErrorHandlerFunction<any>): any;
}
export interface ErrorHandlerFunction<T> {
    (error: Error, config?: AxiosRequestConfig): T;
}
export declare const stRequest: NetworkRequest;
export declare const bindJWTUpdates: (target: IUserConfigurable) => NetworkRequest;
export declare class NetworkHandler {
    _jsonHeaders: any;
    _formHeaders: any;
    _apiKey: any;
    Authorization: any;
    constructor({ headers, apiKey, Authorization }: {
        headers: any;
        apiKey: any;
        Authorization: any;
    });
    post: (url: string, data: any, onError: any, options: NetworkRequestOptions) => void;
    get: (url: string, query: any, onError: any, options: NetworkRequestOptions) => void;
    put: (url: string, data: any, options: NetworkRequestOptions) => void;
    delete: (url: string, data: any, options: NetworkRequestOptions) => void;
}
