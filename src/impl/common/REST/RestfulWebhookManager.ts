import { ChatWebHook} from "../../../models/ChatModels";
import {Promise} from "es6-promise";
import axios from "axios";
import {getJSONHeaders} from "../../utils";
import {DEFAULT_TALK_CONFIG, DELETE, GET, POST, PUT} from "../../../constants/api";
import {SportsTalkConfig} from "../../../models/CommonModels";
import {IWebhookManager} from "../../../API/CommonAPI";

const MISSING_ID = "Missing webhook or webhook missing ID";

export class RestfulWebhookManager implements IWebhookManager {
    private _config: SportsTalkConfig = {appId: ""};
    private _apiHeaders;

    constructor(config: SportsTalkConfig) {
        this.setConfig(config);
    }

    public setConfig(config: SportsTalkConfig) {
        this._config = Object.assign(DEFAULT_TALK_CONFIG, config);
        this._apiHeaders = getJSONHeaders(this._config.apiKey);
    }

    listWebhooks = (): Promise<ChatWebHook[]> => {
        return axios({
            url: `${this._config.endpoint}/webhook`,
            method: GET,
            headers: this._apiHeaders
        }).then(hooks=>{
           return (hooks && hooks.data && hooks.data.webhooks) ? hooks.data.webhooks : []
        })
    }

    createWebhook = (hook: ChatWebHook): Promise<ChatWebHook> =>{
        return axios({
            url: `${this._config.endpoint}/webhook`,
            method: POST,
            headers: this._apiHeaders,
            data: hook
        }).then(response=>{
            return response.data.data;
        })
    }

    updateWebhook = (hook: ChatWebHook): Promise<ChatWebHook> => {
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

    deleteWebhook = (hook: ChatWebHook | string): Promise<ChatWebHook> => {
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
