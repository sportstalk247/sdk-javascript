import {AxiosRequestConfig} from "axios";
import {buildAPI, forceObjKeyOrString, getJSONHeaders} from "../../utils";
import {DEFAULT_CONFIG, DELETE, GET, POST, PUT} from "../../constants/api";
import {
    ListRequest,
    SportsTalkConfig
} from "../../../models/CommonModels";
import {ValidationError} from "../../errors";
import {stRequest} from "../../network";
import {IWebhookService} from "../../../API/webhooks/IWebhookService";
import {Webhook, WebhookListResponse, WebhookLogResponse} from "../../../models/webhooks/Webhooks";

const MISSING_ID = "Missing webhook or webhook missing ID";

/**
 * This class uses REST operations to manage webhooks. Most clients will not need it unless you are building a custom admin UI.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
export class RestfulWebhookService implements IWebhookService {
    private _config: SportsTalkConfig = {appId: ""};
    private _apiHeaders;
    private _apiExt = 'webhook/hooks';

    constructor(config: SportsTalkConfig) {
        this.setConfig(config);
    }

    /**
     * Set config
     * @param config
     */
    public setConfig(config: SportsTalkConfig) {
        this._config = Object.assign(DEFAULT_CONFIG, config);
        this._apiHeaders = getJSONHeaders(this._config.apiToken);
    }

    /**
     * List all webhooks
     */
    listWebhooks = (): Promise<WebhookListResponse> => {
        return stRequest({
            url: buildAPI(this._config, this._apiExt),
            method: GET,
            headers: this._apiHeaders
        }).then(response=>{
           return response.data;
        })
    }

    /**
     * Get Webhook Logs
     */
    listWebhookLogs = (webhook: Webhook | string, logRequest: ListRequest): Promise<WebhookLogResponse> => {
        const id = forceObjKeyOrString(webhook)
        return stRequest({
            url: buildAPI(this._config, `${this._apiExt}/${id}/logentries`),
            method: GET,
            headers: this._apiHeaders
        }).then(response=>{
            return response.data;
        })
    }

    /**
     * Create a webhook
     * @param hook
     */
    createWebhook = (hook: Webhook): Promise<Webhook> =>{
        return stRequest({
            url: buildAPI(this._config, this._apiExt),
            method: POST,
            headers: this._apiHeaders,
            data: hook
        }).then(response=>{
            return response.data
        })
    }

    /**
     * Update an existing hook
     * @param hook
     */
    updateWebhook = (hook: Webhook): Promise<Webhook> => {
        if(!hook || !hook.id) {
            throw new ValidationError(MISSING_ID);
        }
        return stRequest({
            url: buildAPI(this._config, `${this._apiExt}/${hook.id}`),
            method: PUT,
            headers: this._apiHeaders,
            data: hook
        }).then(response=>{
            return <Webhook>response.data
        })
    }

    /**
     * Delete a webhook
     * @param hook
     */
    deleteWebhook = (hook: Webhook | string): Promise<Webhook> => {
        if(!hook) {
            throw new ValidationError(MISSING_ID);
        }
        // @ts-ignore
        const id = hook.id || hook;
        const config:AxiosRequestConfig = {
            url: buildAPI(this._config, `${this._apiExt}/${id}`),
            method: DELETE,
            headers: this._apiHeaders
        }
        return stRequest(config).then(response=>{
            return response.data
        })
    }

}
