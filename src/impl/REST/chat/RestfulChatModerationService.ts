import {
    EventListResponse,
    EventResult,
    MuteOptions, ShadowbanUserApiData
} from "../../../models/ChatModels";
import {stRequest} from '../../network';
import {buildAPI, getJSONHeaders, forceObjKeyOrString} from "../../utils";
import {DEFAULT_CONFIG, GET, POST,} from "../../constants/api";
import {
    RestApiResult,
    SportsTalkConfig
} from "../../../models/CommonModels";
import {AxiosRequestConfig} from "axios";
import {IChatModerationService} from "../../../API/chat/IChatModerationServive";
import {ChatRoomEffectsList, ChatRoomResult} from "../../../models/chat/ChatRoom";
import {User} from "../../../models/user/User";
import {Webhook} from "../../../models/webhooks/Webhooks";
import {ChatModerationQueueListRequest} from "../../../models/Moderation";

/**
 * This class is for moderating chat events.  Most clients will not need this unless you are building a custom moderation UI.
 * @class
 */
export class RestfulChatModerationService implements IChatModerationService {

    private _config: SportsTalkConfig = {appId: ""};
    private _jsonHeaders;
    private _refreshFn;
    private _apiExt:string = 'chat/moderation/queues/events';
    private _handleRefresh = ()=>{}

    constructor(config: SportsTalkConfig) {
        this.setConfig(config);
    }

    /**
     * Set the configuration
     * @param config
     */
    public setConfig(config: SportsTalkConfig) {
        this._config = Object.assign(DEFAULT_CONFIG, config);
        this._refreshFn = config.userTokenRefreshFunction;
        this._jsonHeaders = getJSONHeaders(this._config.apiToken, this._config.userToken);
        if(this._config.userTokenRefreshFunction) {
            
        }
    }

    /**
     * Get the moderation queue of events.
     */
    listMessagesInModerationQueue = (request: ChatModerationQueueListRequest = {}): Promise<EventListResponse> => {
        if(!request) {
            throw new Error("Must submit valid list request");
        }
        const url:string = buildAPI(this._config, `${this._apiExt}?cursor=${request.cursor ? request.cursor : ''}&roomId=${request.roomId? request.roomId :''}&limit=${request.limit?request.limit :''}`);
        const config:AxiosRequestConfig = {
            method: 'GET',
            url,
            headers: this._jsonHeaders
        }
        
        return stRequest(config, this._refreshFn).then(result => {
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
            data: { approve: !!approved + "" }
        }
        return stRequest(config).then(response=>response.data)
    }

    listRoomEffects = (room: ChatRoomResult | string): Promise<ChatRoomEffectsList> => {
        const roomid:string = forceObjKeyOrString(room)
        const config: AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config, `/chat/rooms/${roomid}/usereffects`),
            headers: this._jsonHeaders
        }
        return stRequest(config).then(response=>response.data);
    }

    applyFlagModerationDecision = (user: User | string, room:ChatRoomResult | string, approve: boolean) => {
        const roomid:string = forceObjKeyOrString(room)
        const userid:string = forceObjKeyOrString(user, 'userid');
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `/chat/rooms/${roomid}/moderation/flaggedusers/${userid}/applydecision`),
            headers: this._jsonHeaders,
            data: { approve: !!approve + "" }
        }
        return stRequest(config).then(response=>response.data);
    }

    muteUserInRoom =  (user: User | string, room:ChatRoomResult | string, expireseconds?: number) => {
        const roomid:string = forceObjKeyOrString(room)
        const userid:string = forceObjKeyOrString(user, 'userid');
        const data: MuteOptions = {
            userid,
            mute: true,
            applyeffect: true
        }
        if(expireseconds) {
            data.expireseconds = expireseconds
        }
        const config: AxiosRequestConfig = {
            method:POST,
            url: buildAPI(this._config, `/chat/rooms/${roomid}/mute`),
            headers: this._jsonHeaders,
            data
        }
        return stRequest(config).then(result=>result.data);
    }

    unMuteUserInRoom =  (user: User | string, room:ChatRoomResult | string) => {
        const roomid:string = forceObjKeyOrString(room)
        const userid:string = forceObjKeyOrString(user, 'userid');
        const data: MuteOptions = {
            userid,
            mute: false,
            applyeffect: false
        }

        const config: AxiosRequestConfig = {
            method:POST,
            url: buildAPI(this._config, `/chat/rooms/${roomid}/mute`),
            headers: this._jsonHeaders,
            data
        }
        return stRequest(config).then(result=>result.data);
    }


    shadowbanUserInRoom = (user: User | string, room: ChatRoomResult | string, expiresSeconds?: number): Promise<ChatRoomResult> => {
        const roomId = forceObjKeyOrString(room);
        const userId = forceObjKeyOrString(user, 'userid');
        const data:ShadowbanUserApiData = {
            shadowban: true,
            applyeffect: true,
            userid: userId
        }
        if(expiresSeconds && data.applyeffect) {
            data.expireseconds = expiresSeconds
        }
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${roomId}/shadowban`),
            headers: this._jsonHeaders,
            data
        }
        return stRequest(config).then(result=>result.data);
    }

    unShadowbanUserInRoom = (user: User | string, room: ChatRoomResult | string): Promise<ChatRoomResult> => {
        const roomId = forceObjKeyOrString(room);
        const userId = forceObjKeyOrString(user, 'userid');
        const data:ShadowbanUserApiData = {
            shadowban: false,
            applyeffect: false,
            userid: userId
        }
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${roomId}/shadowban`),
            headers: this._jsonHeaders,
            data
        }
        return stRequest(config).then(result=>result.data);
    }

    purgeMessagesInRoom = (user: User | string, room: ChatRoomResult | string): Promise<any> => {
        const roomId = forceObjKeyOrString(room);
        const userId = forceObjKeyOrString(user, 'userid');
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `/chat/rooms/${roomId}/commands/purge/${userId}`),
            headers: this._jsonHeaders
        }
        return stRequest(config).then(result=>result.data)
    }

}
