import {EventResult} from "../../../models/ChatModels";
import axios, {AxiosRequestConfig} from "axios";
import {buildAPI, formify, getUrlEncodedHeaders} from "../../utils";
import {DEFAULT_TALK_CONFIG, POST, } from "../../../constants/api";
import {IChatModerationManager} from "../../../API/ChatAPI";
import {ApiResult, SportsTalkConfig, WebHook} from "../../../models/CommonModels";

export class RestfulChatModerationManager implements IChatModerationManager {
    private _config: SportsTalkConfig = {appId: ""};
    private _apiHeaders;
    private _apiExt:string = 'chat/moderation/queues/events';

    constructor(config: SportsTalkConfig) {
        this.setConfig(config);
    }

    public setConfig(config: SportsTalkConfig) {
        this._config = Object.assign(DEFAULT_TALK_CONFIG, config);
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiKey);
    }

    getModerationQueue = (): Promise<Array<EventResult>> => {
        return axios({
            method: 'GET',
            url: buildAPI(this._config, this._apiExt),
            headers: this._apiHeaders
        }).then(result => {
            return result.data.data.events;
        });
    }

    rejectEvent = (event: EventResult): Promise<ApiResult<null>> => {
        return axios({
            method: 'POST',
            url: buildAPI(this._config, `${this._apiExt}/${event.id}/applydecision`),
            headers: this._apiHeaders,
            data: {approve: false}
        }).then(result => {
            return result.data;
        }).catch(result => {
            return {}
        })
    }

    approveEvent = (event: EventResult): Promise<ApiResult<null>> => {
        // @ts-ignore
        const id = event.id | event;
        return axios({
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${event.id}/applydecision`),
            headers: this._apiHeaders,
            data: {approve: true}
        }).then(result => result.data)
    }
}
