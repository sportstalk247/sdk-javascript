import { SportsTalkConfig, WebHook} from "../../DataModels";
import {Promise} from "es6-promise";
import axios from "axios";
import {getJSONHeaders} from "../../utils";
import {DEFAULT_CONFIG, DELETE, GET, POST, PUT} from "../../constants";
import {IWebhookManager} from "../../api";

const MISSING_ID = "Missing webhook or webhook missing ID";

export class RestfulWebhookManager implements IWebhookManager {
    private _config: SportsTalkConfig = {};
    private _apiHeaders;

    constructor(config: SportsTalkConfig) {
        this.setConfig(config);
    }

    public setConfig(config: SportsTalkConfig) {
        this._config = Object.assign(DEFAULT_CONFIG, config);
        this._apiHeaders = getJSONHeaders(this._config.apiKey);
    }

    listWebhooks = (): Promise<WebHook[]> => {
        return axios({
            url: `${this._config.endpoint}/webhook`,
            method: GET,
            headers: this._apiHeaders
        }).then(hooks=>{
           return (hooks && hooks.data && hooks.data.webhooks) ? hooks.data.webhooks : []
        })
    }

    createWebhook = (hook: WebHook): Promise<WebHook> =>{
        return axios({
            url: `${this._config.endpoint}/webhook`,
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
            url: `${this._config.endpoint}/webhook/${hook.id}`,
            method: PUT,
            headers: this._apiHeaders,
            data: hook
        }).then(response=>{
            return response.data.data
        })
    }

    deleteWebhook = (hook: WebHook | string): Promise<WebHook> => {
        if(!hook) {
            throw new Error(MISSING_ID);
        }
        // @ts-ignore
        const id = hook.id || hook;
        return axios({
            url: `${this._config.endpoint}/webhook/${id}`,
            method: DELETE,
            headers: this._apiHeaders
        }).then(response=>{
            return response.data;
        })
    }

}
