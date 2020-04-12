import {ApiHeaders, ApiResult, ClientConfig} from "../../../models/CommonModels";
import axios, {AxiosRequestConfig} from "axios";
import {Comment, ConversationDeletionResponse} from "../../../models/ConversationModels";
import {GET, POST} from "../../../constants/api";
import {getUrlEncodedHeaders, getJSONHeaders, buildCommentAPI} from "../../utils";
import {IConversationModerationManager} from "../../../API/ConversationAPI";

export class RestfulConversationModerationManager implements IConversationModerationManager {

    _config: ClientConfig;
    _apiHeaders: ApiHeaders;
    _jsonHeaders: ApiHeaders;
    _apiExt:string = '/comment/moderation/queues/comments';

    public setConfig = (config: ClientConfig) => {
        this._config = config;
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiKey);
        this._jsonHeaders = getJSONHeaders(this._config.apiKey);
    }

    public getModerationQueue = (): Promise<ConversationDeletionResponse> => {
        const config: AxiosRequestConfig = {
            method: GET,
            url: buildCommentAPI(this._config, this._apiExt),
            headers: this._jsonHeaders,
        }
        return axios(config).then(result=>{
            return result.data;
        });
    }

    rejectComment = (comment: Comment): Promise<ApiResult<null>> => {
        return axios({
            method: 'POST',
            url: buildCommentAPI(this._config, `${this._apiExt}/${comment.id}/applydecision`),
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
            url: buildCommentAPI(this._config, `${this._apiExt}/${comment.id}/applydecision`),
            headers: this._apiHeaders,
            data: {approve: true}
        }).then(result => result.data)
    }
}