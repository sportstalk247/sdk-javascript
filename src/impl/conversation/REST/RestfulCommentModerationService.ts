import {ApiHeaders, RestApiResult, ClientConfig} from "../../../models/CommonModels";
import axios, {AxiosRequestConfig} from "axios";
import {Comment} from "../../../models/ConversationModels";
import {DEFAULT_CONFIG, GET, POST} from "../../constants/api";
import {getUrlEncodedHeaders, getJSONHeaders, buildAPI, formify} from "../../utils";
import {ICommentModerationService} from "../../../API/ConversationAPI";
import {SettingsError} from "../../errors";
import {MUST_SET_APPID} from "../../constants/messages";

export class RestfulCommentModerationService implements ICommentModerationService {

    private _config: ClientConfig;
    private _apiHeaders: ApiHeaders;
    private _jsonHeaders: ApiHeaders;
    private _apiExt:string = 'comment/moderation/queues/comments';

    constructor(config?:ClientConfig) {
       this.setConfig(config);
    }

    private _requireAppId = () =>{
        if(!this._config || !this._config.appId) {
            throw new SettingsError(MUST_SET_APPID);
        }
    }

    public getConfig = () => {
        return this._config;
    }

    public setConfig = (config: ClientConfig = {}) => {
        this._config = Object.assign({}, DEFAULT_CONFIG, config);
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiToken);
        this._jsonHeaders = getJSONHeaders(this._config.apiToken);
    }

    public getModerationQueue = (): Promise<Array<Comment>> => {
        this._requireAppId();
        const config: AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config, this._apiExt),
            headers: this._jsonHeaders,
        }
        return axios(config).then(result=>{
            return result.data.data.comments;
        });
    }

    rejectComment = (comment: Comment): Promise<Comment> => {
        const config:AxiosRequestConfig = {
            method: 'POST',
            url: buildAPI(this._config, `${this._apiExt}/${comment.id}/applydecision`),
            headers: this._apiHeaders,
            data: formify({approve: false})
        }
        return axios(config).then(result => {
            return result.data.data;
        })
    }

    approveComment = (comment: Comment): Promise<Comment> => {
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${comment.id}/applydecision`),
            headers: this._apiHeaders,
            data: formify({approve: true})
        };
        return axios(config).then(result => {
            return result.data.data
        })
    }
}