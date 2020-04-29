import axios, {AxiosRequestConfig} from "axios";

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
        }
    })

}

const makeAxiosRequest = async function makeAxiosRequest(config:AxiosRequestConfig) {
    return axios(config).then(result=>result.data);
}

function getRequestLibrary() {
    if (typeof window !== "undefined" && window.fetch) {
        return makeRequest;
    }
    return makeAxiosRequest
}

export const stRequest = getRequestLibrary();

