import {EventResult} from "../../../models/ChatModels";
import {stRequest} from '../../network';
import {buildAPI, formify, getUrlEncodedHeaders} from "../../utils";
import {DEFAULT_CONFIG, POST, } from "../../constants/api";
import {IChatModerationService} from "../../../API/ChatAPI";
import {RestApiResult, SportsTalkConfig, WebHook} from "../../../models/CommonModels";

export class RestfulChatModerationService implements IChatModerationService {
    private _config: SportsTalkConfig = {appId: ""};
    private _apiHeaders;
    private _apiExt:string = 'chat/moderation/queues/events';

    constructor(config: SportsTalkConfig) {
        this.setConfig(config);
    }

    public setConfig(config: SportsTalkConfig) {
        this._config = Object.assign(DEFAULT_CONFIG, config);
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiToken);
    }

    getModerationQueue = (): Promise<Array<EventResult>> => {
        return stRequest({
            method: 'GET',
            url: buildAPI(this._config, this._apiExt),
            headers: this._apiHeaders
        }).then(result => {
            return result.data.events;
        });
    }

    rejectEvent = (event: EventResult): Promise<RestApiResult<null>> => {
        return stRequest({
            method: 'POST',
            url: buildAPI(this._config, `${this._apiExt}/${event.id}/applydecision`),
            headers: this._apiHeaders,
            data: {approve: false}
        }).then(result => {
            return result
        }).catch(result => {
            return {}
        })
    }

    approveEvent = (event: EventResult): Promise<RestApiResult<null>> => {
        // @ts-ignore
        const id = event.id | event;
        return stRequest({
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${event.id}/applydecision`),
            headers: this._apiHeaders,
            data: {approve: true}
        })
    }
}
