import axios, {AxiosRequestConfig} from "axios";
import {buildAPI, getJSONHeaders} from "../../utils";
import {DEFAULT_TALK_CONFIG, DELETE, GET, POST, PUT} from "../../../constants/api";
import {SportsTalkConfig, WebHook} from "../../../models/CommonModels";
import {IWebhookManager} from "../../../API/CommonAPI";

const MISSING_ID = "Missing webhook or webhook missing ID";

export class RestfulWebhookManager implements IWebhookManager {
    private _config: SportsTalkConfig = {appId: ""};
    private _apiHeaders;
    private _apiExt = 'webhook/hooks';

    constructor(config: SportsTalkConfig) {
        this.setConfig(config);
    }

    public setConfig(config: SportsTalkConfig) {
        this._config = Object.assign(DEFAULT_TALK_CONFIG, config);
        this._apiHeaders = getJSONHeaders(this._config.apiToken);
    }

    listWebhooks = (): Promise<WebHook[]> => {
        return axios({
            url: buildAPI(this._config, this._apiExt),
            method: GET,
            headers: this._apiHeaders
        }).then(hooks=>{
           return (hooks && hooks.data && hooks.data.data && hooks.data.data.webhooks) ? hooks.data.data.webhooks : []
        })
    }

    createWebhook = (hook: WebHook): Promise<WebHook> =>{
        return axios({
            url: buildAPI(this._config, this._apiExt),
            method: POST,
            headers: this._apiHeaders,
            data: hook
        }).then(response=>{
            return response.data.data;
        })
    }

    updateWebhook = (hook: WebHook): Promise<WebHook> => {
        if(!hook || !hook.id) {
            throw new Error(MISSING_ID);
        }
        return axios({
            url: buildAPI(this._config, `${this._apiExt}/${hook.id}`),
            method: PUT,
            headers: this._apiHeaders,
            data: hook
        }).then(response=>{
            return <WebHook>response.data.data
        })
    }

    deleteWebhook = (hook: WebHook | string): Promise<WebHook> => {
        if(!hook) {
            throw new Error(MISSING_ID);
        }
        // @ts-ignore
        const id = hook.id || hook;
        const config:AxiosRequestConfig = {
            url: buildAPI(this._config, `${this._apiExt}/${id}`),
            method: DELETE,
            headers: this._apiHeaders
        }
        return axios(config).then(response=>{
            return response.data.data;
        })
    }

}
