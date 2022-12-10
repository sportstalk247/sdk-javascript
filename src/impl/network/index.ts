import axios, {AxiosRequestConfig} from "axios";
import {IUserConfigurable, NetworkRequestOptions} from '../../API/Configuration';

export interface NetworkRequest {
    (config:AxiosRequestConfig, errorHandlerfunction?: ErrorHandlerFunction<any>):any
}
/**
 * Make request with fetch. Originally axios was used everywhere for compatibility but this caused more errors with modern browsers as
 * Axios default cors handling was not as flexible.
 * @param config
 */
//@ts-ignore
const makeRequest = async function makeRequest(config:Request | AxiosRequestConfig) {
    // @ts-ignore
    if(config.data) {
            // @ts-ignore
            config.body = JSON.stringify(config.data);
    }
    config.headers['Content-Type'] = 'application/json';
    // @ts-ignore
    return window.fetch(config.url, config).then((response:Response)=>{
        if(response.ok) {
            return response.json()
        } else {
            const error = new Error(response.statusText);
            // @ts-ignore
            error.response = {
                status: response.status
            }
            throw error;
        }
    });

}
/**
 * Make request with axios on server
 * @param config
 */
const makeAxiosRequest = async function makeAxiosRequest(config:AxiosRequestConfig, errorHandlerfunction?: ErrorHandlerFunction<any>) {
    if(config && config.headers) {
        // @ts-ignore
        config.decompress=true
    }
    return axios(config).then(result=>result.data).catch(e=>{
        if(errorHandlerfunction) {
            return errorHandlerfunction(e);
        }
        throw e;
    })
}

function getRequestLibrary(): NetworkRequest {
    //@ts-ignore
    if (typeof window !== "undefined" && window.fetch) {
        return makeRequest;
    }
    return makeAxiosRequest
}

export interface ErrorHandlerFunction<T> {
    (error: Error):T
}

export const stRequest = getRequestLibrary();

export const bindJWTUpdates = (target: IUserConfigurable): NetworkRequest => async (config:AxiosRequestConfig, errorHandlerfunction?: ErrorHandlerFunction<any>) => {
    const exp = target.getTokenExp();
    if(exp && exp < new Date().getTime()-20) {
        await target.refreshUserToken();
    }
    return stRequest(config, errorHandlerfunction)
}



export class NetworkHandler {
    _jsonHeaders
    _formHeaders
    _apiKey
    Authorization

    constructor({headers, apiKey, Authorization}) {
        this._apiKey = apiKey;
        this.Authorization = Authorization;
    }

    post = (url:string, data, onError, options: NetworkRequestOptions) => {

    }
    get = (url:string, query, onError, options: NetworkRequestOptions) => {

    }
    put = (url:string, data, options: NetworkRequestOptions) => {

    }
    delete = (url: string, data, options:NetworkRequestOptions) => {

    }

}
