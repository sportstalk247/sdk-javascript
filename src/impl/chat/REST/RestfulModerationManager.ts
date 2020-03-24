import {EventResult, ChatWebHook} from "../../../models/ChatModels";
import {Promise} from "es6-promise";
import axios from "axios";
import {formify, getUrlEncodedHeaders} from "../../../utils";
import {DEFAULT_TALK_CONFIG, POST, } from "../../../constants";
import {IModerationManager} from "../../../API/ChatAPI";
import {ApiResult, SportsTalkConfig} from "../../../models/CommonModels";


export class RestfulModerationManager implements IModerationManager {
    private _config: SportsTalkConfig = {};
    private _apiHeaders;

    constructor(config: SportsTalkConfig) {
        this.setConfig(config);
    }

    public setConfig(config: SportsTalkConfig) {
        this._config = Object.assign(DEFAULT_TALK_CONFIG, config);
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiKey);
    }

    getModerationQueueEvents = (): Promise<Array<EventResult>> => {
        return axios({
            method: 'GET',
            url: `${this._config.endpoint}/moderation/queue`,
            headers: this._apiHeaders
        }).then(result => {
            return result.data.data.events;
        });
    }

    removeEvent = (event: EventResult): Promise<ApiResult<null>> => {
        return axios({
            method: 'POST',
            url: `${this._config.endpoint}/moderation/applydecisiontoevent/${event.id}`,
            headers: this._apiHeaders,
            data: formify({approve: false})
        }).then(result => {
            return result.data;
        }).catch(result => {
            return {}
        })
    }

    reportEvent = (event: EventResult): Promise<ApiResult<null> | Error> => {
        // @ts-ignore
        const id = event.id | event;
        return axios({
            method: POST,
            url: `${this._config.endpoint}/room/${event.roomId}/report/${event.id}`,
            headers: this._apiHeaders
        }).then(result => result)
    }

    approveEvent = (event: EventResult): Promise<ApiResult<null> | Error> => {
        // @ts-ignore
        const id = event.id | event;
        return axios({
            method: POST,
            url: `${this._config.endpoint}/moderation/applydecisiontoevent/${event.id}`,
            headers: this._apiHeaders,
            data: formify({approve: true})
        }).then(result => result)
    }
}
