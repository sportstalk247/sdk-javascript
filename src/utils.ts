/**
 * Creates a one-layer-deep urlEncoded string.
 * @param data
 */
import {APPLICATION_JSON, FORM_ENCODED} from "./constants";
import {ApiHeaders} from "./models/CommonModels";
import {Comment, Conversation} from "./models/ConversationModels";

export function formify(data) {
    const formBody: Array<String> = []
    for (const property in data) {
        const encodedKey = property;
        const  encodedValue = encodeURIComponent(data[property]);
        formBody.push(`${encodedKey}=${encodedValue}`);
    }
    return formBody.join("&");
}

/**
 * Gets proper API headers with optional token.  Without the token, most requests do not require CORS.
 * @param apiKey
 */
export function getUrlEncodedHeaders(apiKey?: string): ApiHeaders {
    const headers  = {
      'Content-Type':FORM_ENCODED,
    }
    if(apiKey) {
        headers['x-api-token'] = apiKey
    }
    return headers;
}

export function getJSONHeaders(apiKey?: string): ApiHeaders {
    const headers  = {
        'Content-Type': APPLICATION_JSON
    }
    if(apiKey) {
        headers['x-api-token'] = apiKey
    }
    return headers;
}
