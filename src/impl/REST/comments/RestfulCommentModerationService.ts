import {ApiHeaders, RestApiResult, ClientConfig} from "../../../models/CommonModels";
import {AxiosRequestConfig} from "axios";
import {stRequest} from '../../network';
import {Comment, CommentListResponse, CommentResult} from "../../../models/CommentsModels";
import {DEFAULT_CONFIG, GET, POST} from "../../constants/api";
import {getUrlEncodedHeaders, getJSONHeaders, buildAPI, formify} from "../../utils";
import {ICommentModerationService} from "../../../API/CommentsAPI";
import {SettingsError} from "../../errors";
import {MUST_SET_APPID} from "../../constants/messages";

/**
 * Primary REST class for moderating comments.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
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
    public listCommentsInModerationQueue = (cursor: string = ''): Promise<CommentListResponse> => {
        this._requireAppId();
        const config: AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config, `${this._apiExt}?cursor=${cursor}`),
            headers: this._jsonHeaders,
        }
        return stRequest(config).then(result=>{
            return result.data
        });
    }

    /**
     * Reject a comment, removing it from the comments
     * @param comment
     */
    rejectComment = (comment: CommentResult): Promise<CommentResult> => {
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
     * Moderate a comment
     * @param comment
     */
    moderateComment = (comment: CommentResult, approve: boolean): Promise<CommentResult> => {
        const config:AxiosRequestConfig = {
            method: 'POST',
            url: buildAPI(this._config, `${this._apiExt}/${comment.id}/applydecision`),
            headers: this._apiHeaders,
            data: formify({approve: approve})
        }
        return stRequest(config).then(result => {
            return result.data
        })
    }

    /**
     * Approve a comment, allowing it to show in a comments.
     * @param comment
     */
    approveComment = (comment: Comment): Promise<CommentResult> => {
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