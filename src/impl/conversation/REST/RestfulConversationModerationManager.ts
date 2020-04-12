import {ApiHeaders, ApiResult, ClientConfig} from "../../../models/CommonModels";
import axios, {AxiosRequestConfig} from "axios";
import {Comment} from "../../../models/ConversationModels";
import {GET, POST} from "../../../constants/api";
import {getUrlEncodedHeaders, getJSONHeaders, buildAPI} from "../../utils";
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
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiKey);
        this._jsonHeaders = getJSONHeaders(this._config.apiKey);
    }

    public getModerationQueue = (): Promise<Array<Comment>> => {
        const config: AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config, this._apiExt),
            headers: this._jsonHeaders,
        }
        return axios(config).then(result=>{
            return result.data.data.comments;
        }).catch(e=>{
            throw e;
        });
    }

    rejectComment = (comment: Comment): Promise<ApiResult<null>> => {
        return axios({
            method: 'POST',
            url: buildAPI(this._config, `${this._apiExt}/${comment.id}/applydecision`),
            headers: this._apiHeaders,
            data: {approve: false}
        }).then(result => {
            return result.data;
        }).catch(result => {
            return {}
        })
    }

    approveComment = (comment: Comment): Promise<ApiResult<null>> => {
        return axios({
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${comment.id}/applydecision`),
            headers: this._apiHeaders,
            data: {approve: true}
        }).then(result => result.data)
    }
}