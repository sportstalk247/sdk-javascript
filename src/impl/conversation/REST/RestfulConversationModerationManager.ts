import {ApiHeaders, ApiResult, ClientConfig} from "../../../models/CommonModels";
import axios, {AxiosRequestConfig} from "axios";
import {Conversation, Comment, ConversationDeletionResponse} from "../../../models/ConversationModels";
import {GET, POST} from "../../../constants";
import {getUrlEncodedHeaders, getJSONHeaders, buildAPI} from "../../../utils";
import {IConversationModerationManager} from "../../../API/ConversationAPI";
import {Promise} from "es6-promise";

export class RestfulConversationModerationManager implements IConversationModerationManager {

    _config: ClientConfig;
    _apiHeaders: ApiHeaders;
    _jsonHeaders: ApiHeaders;

    public setConfig = (config: ClientConfig) => {
        this._config = config;
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiKey);
        this._jsonHeaders = getJSONHeaders(this._config.apiKey);
    }

    public getModerationQueue = (conversation: Conversation | string): Promise<ConversationDeletionResponse> => {
        const config: AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config, `/comment/moderation/queues/comments`),
            headers: this._jsonHeaders,
        }
        return axios(config).then(result=>{
            return result.data;
        });
    }

    rejectComment = (comment: Comment): Promise<ApiResult<null>> => {
        return axios({
            method: 'POST',
            url: buildAPI(this._config, `/comment/moderation/queues/comments/${comment.id}/applydecision`),
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
            url: buildAPI(this._config, `/chat/moderation/queues/comments/${comment.id}/applydecision`),
            headers: this._apiHeaders,
            data: {approve: true}
        }).then(result => result.data)
    }
}