import {ApiHeaders, RestApiResult, ClientConfig} from "../../../models/CommonModels";
import {AxiosRequestConfig} from "axios";
import {stRequest} from '../../network';
import {Comment} from "../../../models/ConversationModels";
import {DEFAULT_CONFIG, GET, POST} from "../../constants/api";
import {getUrlEncodedHeaders, getJSONHeaders, buildAPI, formify} from "../../utils";
import {ICommentModerationService} from "../../../API/ConversationAPI";
import {SettingsError} from "../../errors";
import {MUST_SET_APPID} from "../../constants/messages";

/**
 * Primary REST class for moderating comments.
 */
export class RestfulCommentModerationService implements ICommentModerationService {

    private _config: ClientConfig;
    private _apiHeaders: ApiHeaders;
    private _jsonHeaders: ApiHeaders;
    private _apiExt:string = 'comment/moderation/queues/comments';

    constructor(config?:ClientConfig) {
       this.setConfig(config);
    }

    /**
     * Used to ensure we have an appID for operations
     * @private
     */
    private _requireAppId = () =>{
        if(!this._config || !this._config.appId) {
            throw new SettingsError(MUST_SET_APPID);
        }
    }

    /**
     * Get current config.
     */
    public getConfig = () => {
        return this._config;
    }

    /**
     * Set configuration
     * @param config
     */
    public setConfig = (config: ClientConfig = {}) => {
        this._config = Object.assign({}, DEFAULT_CONFIG, config);
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiToken);
        this._jsonHeaders = getJSONHeaders(this._config.apiToken);
    }

    /**
     * Get the moderation queue
     */
    public getModerationQueue = (): Promise<Array<Comment>> => {
        this._requireAppId();
        const config: AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config, this._apiExt),
            headers: this._jsonHeaders,
        }
        return stRequest(config).then(result=>{
            return result.data.comments;
        });
    }

    /**
     * Reject a comment, removing it from the conversation
     * @param comment
     */
    rejectComment = (comment: Comment): Promise<Comment> => {
        const config:AxiosRequestConfig = {
            method: 'POST',
            url: buildAPI(this._config, `${this._apiExt}/${comment.id}/applydecision`),
            headers: this._apiHeaders,
            data: formify({approve: false})
        }
        return stRequest(config).then(result => {
            return result.data
        })
    }

    /**
     * Approve a comment, allowing it to show in a conversation.
     * @param comment
     */
    approveComment = (comment: Comment): Promise<Comment> => {
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${comment.id}/applydecision`),
            headers: this._apiHeaders,
            data: formify({approve: true})
        };
        return stRequest(config).then(result => {
            return result.data
        })
    }
}