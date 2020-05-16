import {EventListResponse, EventResult} from "../../../models/ChatModels";
import {stRequest} from '../../network';
import {buildAPI, getUrlEncodedHeaders} from "../../utils";
import {DEFAULT_CONFIG, POST, } from "../../constants/api";
import {IChatModerationService} from "../../../API/ChatAPI";
import {RestApiResult, SportsTalkConfig, Webhook} from "../../../models/CommonModels";

/**
 * This class is for moderating chat events.  Most clients will not need this unless you are building a custom moderation UI.
 */
export class RestfulChatModerationService implements IChatModerationService {

    private _config: SportsTalkConfig = {appId: ""};
    private _apiHeaders;
    private _apiExt:string = 'chat/moderation/queues/events';

    constructor(config: SportsTalkConfig) {
        this.setConfig(config);
    }

    /**
     * Set the configuration
     * @param config
     */
    public setConfig(config: SportsTalkConfig) {
        this._config = Object.assign(DEFAULT_CONFIG, config);
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiToken);
    }

    /**
     * Get the moderation queue of events.
     */
    getModerationQueue = (): Promise<EventListResponse> => {
        return stRequest({
            method: 'GET',
            url: buildAPI(this._config, this._apiExt),
            headers: this._apiHeaders
        }).then(result => {
            return result.data
        });
    }

    /**
     * Reject an event, removing it from the chat.
     * @param event
     */
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

    /**
     * Approve an event, clearing it for the chat.
     * @param event
     */
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
