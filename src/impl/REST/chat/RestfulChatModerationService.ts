import {EventListResponse, EventResult} from "../../../models/ChatModels";
import {stRequest} from '../../network';
import {buildAPI, getJSONHeaders, getUrlEncodedHeaders} from "../../utils";
import {DEFAULT_CONFIG, POST, } from "../../constants/api";
import {IChatModerationService} from "../../../API/ChatAPI";
import {ChatModerationQueueListRequest, RestApiResult, SportsTalkConfig, Webhook} from "../../../models/CommonModels";
import {AxiosRequestConfig} from "axios";

/**
 * This class is for moderating chat events.  Most clients will not need this unless you are building a custom moderation UI.
 * @class
 */
export class RestfulChatModerationService implements IChatModerationService {

    private _config: SportsTalkConfig = {appId: ""};
    private _apiHeaders;
    private _jsonHeaders;
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
        this._jsonHeaders = getJSONHeaders(this._config.apiToken);
    }

    /**
     * Get the moderation queue of events.
     */
    listMessagesInModerationQueue = (request: ChatModerationQueueListRequest): Promise<EventListResponse> => {
        const url:string = buildAPI(this._config, `${this._apiExt}?cursor=${request.cursor ? request.cursor : ''}&roomId=${request.roomId? request.roomId :''}&limit=${request.limit?request.limit :''}`);
        const config:AxiosRequestConfig = {
            method: 'GET',
            url,
            headers: this._jsonHeaders
        }
        return stRequest(config).then(result => {
            return result.data
        });
    }

    /**
     * Reject an event, removing it from the chat.
     * @param event
     */
    moderateEvent = (event: EventResult, approved: boolean): Promise<EventResult> => {
        const config: AxiosRequestConfig = {
            method: 'POST',
            url: buildAPI(this._config, `${this._apiExt}/${event.id}/applydecision`),
            headers: this._jsonHeaders,
            data: {approve: !!approved + ""}
        }
        return stRequest(config).then(response=>response.data)
    }
}
