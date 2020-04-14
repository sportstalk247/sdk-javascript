import {ApiHeaders, ApiResult, ClientConfig} from "../../../models/CommonModels";
import axios, {AxiosRequestConfig} from "axios";
import {Comment} from "../../../models/ConversationModels";
import {GET, POST} from "../../../constants/api";
import {getUrlEncodedHeaders, getJSONHeaders, buildAPI, formify} from "../../utils";
import {IConversationModerationManager} from "../../../API/ConversationAPI";

export class RestfulConversationModerationManager implements IConversationModerationManager {

    _config: ClientConfig;
    _apiHeaders: ApiHeaders;
    _jsonHeaders: ApiHeaders;
    _apiExt:string = 'comment/moderation/queues/comments';
    constructor(config?:ClientConfig) {
       if(config) {
           this.setConfig(config);
       }

    }

    public setConfig = (config: ClientConfig) => {
        this._config = config;
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiToken);
        this._jsonHeaders = getJSONHeaders(this._config.apiToken);
    }

    public getModerationQueue = (): Promise<Array<Comment>> => {
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