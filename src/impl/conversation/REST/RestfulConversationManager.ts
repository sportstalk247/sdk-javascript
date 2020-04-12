import {ApiHeaders, ClientConfig} from "../../../models/CommonModels";
import axios, {AxiosRequestConfig} from "axios";
import {Conversation, ConversationResponse, ConversationDeletionResponse} from "../../../models/ConversationModels";
import {GET, POST, DELETE} from "../../../constants";
import {getUrlEncodedHeaders, getJSONHeaders, buildAPI} from "../../../utils";
import {IConversationManager} from "../../../API/ConversationAPI";
import {getUrlConversationId} from "../ConversationUtils";

export class RestfulConversationManager implements IConversationManager {

    _config: ClientConfig;
    _apiHeaders: ApiHeaders;
    _jsonHeaders: ApiHeaders;

    public setConfig = (config: ClientConfig) => {
        this._config = config;
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiKey);
        this._jsonHeaders = getJSONHeaders(this._config.apiKey);
    }

    public createConversation = (settings: Conversation): Promise<ConversationResponse> => {
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `comment/conversations`),
            headers: this._jsonHeaders,
            data: settings,
        };
        return axios(config).then(result=>{
           return result.data.data;
        }).catch(e=>{
            throw e;
        });
    }

    public getConversation = (conversation: Conversation | string): Promise<ConversationResponse> => {
        // @ts-ignore
        const id = getUrlConversationId(conversation);
        return axios({
            method: GET,
            url: buildAPI(this._config, `comment/conversations/${this._config.appId}/${id}`),
            headers: this._jsonHeaders,
        }).then(result=>{
            return result.data;
        });
    }

    public getConversationsByProperty = (property:string): Promise<Array<Conversation>> => {
        // @ts-ignore
        return axios({
            method: GET,
            url: buildAPI(this._config, `comment/conversations/${this._config.appId}?propertyid=${property}`),
            headers: this._jsonHeaders,
        }).then(result=>{
            return result;
        });
    }

    // Deletes a conversation.
    public deleteConversation = (conversation: Conversation | string): Promise<ConversationDeletionResponse> => {
        // @ts-ignore
        const id = getUrlConversationId(conversation);
        // @ts-ignore
        const config: AxiosRequestConfig = {
            method: DELETE,
            url: buildAPI(this._config, `comment/conversations/${id}`),
            headers: this._jsonHeaders,
        }
        return axios(config).then(result=>{
            return result.data;
        });
    }
}