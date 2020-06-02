import axios, {AxiosRequestConfig} from "axios";

/**
 * Make request with fetch. Originally axios was used everywhere for compatibility but this caused more errors with modern browsers as
 * Axios default cors handling was not as flexible.
 * @param config
 */
const makeRequest = async function makeRequest(config:Request | AxiosRequestConfig) {
    // @ts-ignore
    if(config.data) {
            // @ts-ignore
            config.body = JSON.stringify(config.data);
    }
    // @ts-ignore
    config.cors = 'no-cors';
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
const makeAxiosRequest = async function makeAxiosRequest(config:AxiosRequestConfig) {
    if(config && config.headers) {
        // @ts-ignore
        config.decompress=true
    }
    return axios(config).then(result=>result.data);
}

function getRequestLibrary() {
    if (typeof window !== "undefined" && window.fetch) {
        return makeRequest;
    }
    return makeAxiosRequest
}

export const stRequest = getRequestLibrary();

