import {API_TOKEN_HEADER, APPLICATION_JSON, FORM_ENCODED} from "./constants/api";
import {ApiHeaders, SportsTalkConfig} from "../models/CommonModels";
import {CommentRequest} from "../models/ConversationModels";
import {ValidationError} from "./errors";

export function formify(data) {
    const formBody: Array<String> = []
    for (const property in data) {
        const encodedKey = property;
        const  encodedValue = encodeURIComponent(data[property]);
        formBody.push(`${encodedKey}=${encodedValue}`);
    }
    return formBody.join("&");
}

export function buildAPI(config: SportsTalkConfig, ext: string, request?: CommentRequest): string {
    let endpoint = `${config.endpoint}/${config.appId}/${ext}`;
    if(request && Object.keys(request).length > 0) {
        endpoint = `${endpoint}?${formify(request)}`;
    }
    return endpoint;
}
/**
 * Gets proper API headers with optional token.
 * Without the token, most requests do not require CORS, however you will need to provide a token injection proxy.
 * @param apiKey
 */
export function getUrlEncodedHeaders(apiKey?: string): ApiHeaders {
    const headers  = {
      'Content-Type':FORM_ENCODED,
    }
    if(apiKey) {
        headers[API_TOKEN_HEADER] = apiKey
    }
    return headers;
}

export function getJSONHeaders(apiKey?: string): ApiHeaders {
    const headers  = {
        // 'Content-Type': APPLICATION_JSON // causes issues in browsers with cors, but not necessary for server.
    }
    if(apiKey) {
        headers[API_TOKEN_HEADER] = apiKey
    }
    return headers;
}

export function forceObjKeyOrString(obj, key = 'id'): string{
    const val = obj[key] || obj;
    if(typeof val === 'string') {
        return val;
    }
    throw new ValidationError(`Missing required string property ${key}`);
}