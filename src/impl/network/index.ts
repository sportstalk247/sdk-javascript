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
// Neither transport had a timeout, so a hung connection never rejected. Bound every
// request; callers can still override per-request via config.timeout.
const DEFAULT_TIMEOUT_MS = 30000;

const makeRequest = async function makeRequest(config:Request | AxiosRequestConfig, errorHandlerfunction?: ErrorHandlerFunction<any>) {
    // `c` is the same object, typed loosely so we can read fetch/axios-shaped fields
    // without a forest of @ts-ignore.
    const c:any = config || { headers:{} };
    c.headers = c.headers || {};
    if(c.data) {
        c.body = JSON.stringify(c.data);
        // Default the JSON content type only for requests that carry a body, and never
        // clobber a Content-Type the caller set deliberately (e.g. url-encoded headers).
        if(!c.headers['Content-Type'] && !c.headers['content-type']) {
            c.headers['Content-Type'] = 'application/json';
        }
    }
    // fetch has no built-in timeout — abort if it hangs.
    const w:any = (typeof window !== 'undefined') ? window : {};
    const AbortCtor:any = w.AbortController;
    let controller:any;
    let timer:any;
    if (AbortCtor && !c.signal) {
        controller = new AbortCtor();
        c.signal = controller.signal;
        timer = setTimeout(() => { if (controller) { controller.abort(); } }, c.timeout || DEFAULT_TIMEOUT_MS);
    }
    const clearTimer = () => { if (timer) { clearTimeout(timer); timer = null; } };
    return w.fetch(c.url, c).then((response:Response)=>{
        clearTimer();
        if(response.ok) {
            // Tolerate empty / non-JSON 2xx bodies (204 No Content, keep-alive touch,
            // deletes). response.json() throws on an empty body; axios does not — this
            // keeps the two transports consistent.
            return response.text().then((raw:string) => {
                if(!raw) { return null; }
                try { return JSON.parse(raw); } catch (parseErr) { return raw; }
            });
        }
        // Non-2xx: surface the upstream body instead of only the status text. The API
        // returns { kind, code, message, data }; throwing new Error(response.statusText)
        // only ever gave callers "Bad Request" and discarded the actual reason, leaving
        // every integration blind to WHY a request failed.
        return response.text().then((raw:string)=>{
            let parsed:any = null;
            try { parsed = raw ? JSON.parse(raw) : null; } catch (parseErr) { /* non-JSON body */ }
            const reason = (parsed && (parsed.message || parsed.error)) || response.statusText || `HTTP ${response.status}`;
            const error:any = new Error(reason);
            // Mirror the axios error shape so consumers can read e.response.{status,statusText,data}.
            error.response = { status: response.status, statusText: response.statusText, data: parsed, body: raw };
            if (parsed) { error.data = parsed; }
            throw error;
        });
    }).catch((e:any)=>{
        clearTimer();
        // Network failure (offline/DNS/CORS/abort) produces an Error with no `.response`.
        // Match the axios path: route through the error handler if one was supplied.
        if (errorHandlerfunction) { return errorHandlerfunction(e, config as AxiosRequestConfig); }
        throw e;
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
    if(config && !config.timeout) {
        config.timeout = DEFAULT_TIMEOUT_MS;
    }
    return axios(config).then(result=>{
        return result.data
    }).catch(e=>{
        if(errorHandlerfunction) {
            return errorHandlerfunction(e, config);
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
    (error: Error, config?: AxiosRequestConfig):T
}

export const stRequest = getRequestLibrary();

// Refresh the JWT this many ms before it actually expires.
const JWT_REFRESH_SKEW_MS = 30000;

export const bindJWTUpdates = (target: IUserConfigurable): NetworkRequest => {
    // Memoize an in-flight refresh so concurrent requests (polling + keep-alive + a user
    // action firing at once) share ONE refresh instead of each calling refreshUserToken()
    // and racing to overwrite the token.
    let refreshInFlight:Promise<any> | null = null;
    return async (config:AxiosRequestConfig, errorHandlerfunction?: ErrorHandlerFunction<any>) => {
        // getTokenExp() returns the JWT `exp` claim, which is in SECONDS since epoch.
        // The previous check compared it against Date.now() (MILLISECONDS), so it was
        // always true and refreshed on every request (or never, where exp is 0).
        const exp = target.getTokenExp();
        if(exp && (exp * 1000) < Date.now() + JWT_REFRESH_SKEW_MS) {
            if(!refreshInFlight) {
                refreshInFlight = Promise.resolve(target.refreshUserToken())
                    .then((t) => { refreshInFlight = null; return t; },
                          (err) => { refreshInFlight = null; throw err; });
            }
            const token = await refreshInFlight;
            if(token) {
                //@ts-ignore
                config.headers = config.headers || {};
                //@ts-ignore
                config.headers['Authorization'] = `Bearer ${token}`
            }
        }
        return stRequest(config, errorHandlerfunction)
    }
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

    // These were never implemented and nothing in the SDK instantiates NetworkHandler.
    // Left as no-ops they silently resolved `undefined`, which is a trap for any future
    // caller — fail loudly instead.
    post = (url:string, data, onError, options: NetworkRequestOptions) => {
        throw new Error('NetworkHandler.post is not implemented; use stRequest().');
    }
    get = (url:string, query, onError, options: NetworkRequestOptions) => {
        throw new Error('NetworkHandler.get is not implemented; use stRequest().');
    }
    put = (url:string, data, options: NetworkRequestOptions) => {
        throw new Error('NetworkHandler.put is not implemented; use stRequest().');
    }
    delete = (url: string, data, options:NetworkRequestOptions) => {
        throw new Error('NetworkHandler.delete is not implemented; use stRequest().');
    }

}
