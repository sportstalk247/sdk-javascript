import {ApiHeaders, ClientConfig} from "../../../models/CommonModels";
import axios, {AxiosRequestConfig} from "axios";
import {
    Conversation,
    ConversationResponse,
    ConversationDeletionResponse,
    ConversationRequest, ConversationListResponse
} from "../../../models/CommentsModels";
import {GET, POST, DELETE} from "../../constants/api";
import {getUrlEncodedHeaders, getJSONHeaders, buildAPI, formify} from "../../utils";
import {IConversationService} from "../../../API/CommentsAPI";
import {getUrlConversationId} from "./ConversationUtils";
import {stRequest} from "../../network";

/**
 * This is the class that governs the lifecycle of conversations.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 */
export class RestfulConversationService implements IConversationService {

    _config: ClientConfig;
    _apiHeaders: ApiHeaders;
    _jsonHeaders: ApiHeaders;
    _apiExt:string = 'comment/conversations'

    /**
     * Create a new comments service
     * @param config
     */
    constructor(config?:ClientConfig) {
        if(config) {
            this.setConfig(config);
        }
    }

    /**
     * Set configuraiton
     * @param config
     */
    public setConfig = (config: ClientConfig) => {
        this._config = config;
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiToken);
        this._jsonHeaders = getJSONHeaders(this._config.apiToken);
    }

    /**
     * Create a comments
     * @param settings
     */
    public createConversation = (settings: Conversation): Promise<ConversationResponse> => {
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, this._apiExt),
            headers: this._jsonHeaders,
            data: settings,
        };
        return stRequest(config).then(result=>{
           return result.data
        });
    }

    /**
     * Get a conversation object
     * @param conversation
     */
    public getConversation = (conversation: Conversation | string): Promise<ConversationResponse> => {
        // @ts-ignore
        const id = getUrlConversationId(conversation);
        const config: AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config, `${this._apiExt}/${id}`),
            headers: this._jsonHeaders,
        }
        return stRequest(config).then(result=>{
            return result.data
        });
    }

    /**
     * Deletes a conversation and all the comments in it.
     */
    public deleteConversation = (conversation: Conversation | string): Promise<ConversationDeletionResponse> => {
        // @ts-ignore
        const id = getUrlConversationId(conversation);
        // @ts-ignore
        const config: AxiosRequestConfig = {
            method: DELETE,
            url: buildAPI(this._config, `${this._apiExt}/${id}`),
            headers: this._jsonHeaders,
        }
        return stRequest(config);
    }

    /**
     * List available conversations
     * @param filter
     */
    public listConversations = (filter?: ConversationRequest): Promise<ConversationListResponse> => {
        let query = "";
        if(filter) {
            query = `?${formify(filter)}`;
        }
        const config: AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config, `${this._apiExt}/${query}`),
            headers: this._jsonHeaders,
        }
        return stRequest(config).then(response=>response.data);
    }
}