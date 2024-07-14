import {
    ApiHeaders,
    ClientConfig, HasCustomId,
    Reaction, ReactionCommand,
    SportsTalkConfig,
    UserTokenRefreshFunction
} from "../../../models/CommonModels";
import axios, {AxiosRequestConfig} from "axios";
import {
    Conversation,
    ConversationResponse,
    ConversationDeletionResponse,
    ConversationRequest,
    ConversationListResponse,
    User,
    ConversationDetailsListResponse,
    ConversationBatchListOptions,
    HasConversationID
} from "../../../models/CommentsModels";
import {GET, POST, DELETE} from "../../constants/api";
import {getUrlEncodedHeaders, getJSONHeaders, buildAPI, formify, forceObjKeyOrString} from "../../utils";
import {getUrlConversationId} from "./ConversationUtils";
import {bindJWTUpdates, NetworkRequest, stRequest} from "../../network";
import {IConversationService} from "../../../API/comments/IConversationService";
import { IUserConfigurable } from "../../../API/Configuration";
import {UserResult} from "../../../models/user/User";

/**
 * This is the class that governs the lifecycle of conversations.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
export class RestfulConversationService implements IConversationService, IUserConfigurable {

    _config: SportsTalkConfig;
    _apiHeaders: ApiHeaders;
    _jsonHeaders: ApiHeaders;
    _apiExt:string = 'comment/conversations'
    private request: NetworkRequest = bindJWTUpdates(this);
    /**
     * Create a new comments service
     * @param config
     */
    constructor(config?:SportsTalkConfig) {
        if(config) {
            this.setConfig(config);
        }
    }


    resetConversation = (conversation:HasConversationID | string):Promise<ConversationResponse> => {
        const conversation_id = getUrlConversationId(conversation);
        if(!conversation_id) {
            throw new Error("Must supply a conversation id to reset a conversation");
        }
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${conversation_id}/reset`),
            headers: this._jsonHeaders,
        }
        return this.request(config).then(result=>{
            return result.data
        });
    }

    getCurrentUser = (): User | null | undefined => {
       return this._config.user
    }
    getUserToken = async (): Promise<string> => {
       return this._config.userToken || ''
    }
    refreshUserToken = async (): Promise<string> => {
       if(this._config.userTokenRefreshFunction) {
           return this._config.userTokenRefreshFunction(this._config.userToken || '');
       }
       return '';
    }
    getTokenExp(): number {
        return 0;
    }

    public setUser = (user: User) => {
        this._config.user = user;
    }
    /**
     * Set configuraiton
     * @param config
     */
    public setConfig = (config: SportsTalkConfig) => {
        this._config = config;
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiToken, this._config.userToken);
        this._jsonHeaders = getJSONHeaders(this._config.apiToken, this._config.userToken);
    }

    /**
     * Sets the user's JWT access token
     * @param userToken
     */
    public setUserToken = (userToken:string) => {
        this._config.userToken = userToken;
        this.setConfig(this._config);
    }

    /**
     * Sets a refreshFunction for the user's JWT token.
     * @param refreshFunction
     */
    public setUserTokenRefreshFunction = (refreshFunction: UserTokenRefreshFunction) => {
        this._config.userTokenRefreshFunction = refreshFunction;
        this.setConfig(this._config);
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
        return this.request(config).then(result=>{
           return result.data
        });
    }

    /**
     * Get a conversation object
     * @param conversation
     */
    public getConversation = (conversation: HasConversationID | string): Promise<ConversationResponse> => {
        // @ts-ignore
        const id = getUrlConversationId(conversation);
        if(!id) {
            throw new Error("Must supply a conversationid to get a conversation");
        }
        const config: AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config, `${this._apiExt}/${id}`),
            headers: this._jsonHeaders,
        }
        return this.request(config).then(result=>{
            return result.data
        });
    }

    public reactToConversationTopic = (conversation: HasConversationID | string, reaction: ReactionCommand = {reaction:'like', reacted: true}, user?: User): Promise<ConversationResponse> => {
        const id = getUrlConversationId(conversation);
        const reactingUser = user ||  this._config.user;
        const userid = forceObjKeyOrString(reactingUser, 'userid');
        if(!reaction) {
            throw new Error("Must provide a ReactionCommand object to react or send nothing to do a default like")
        }
        if(!userid) {
            throw new Error("Must send a userid to react to a conversation topic")
        }
        if(!id) {
            throw new Error("Must have a conversation ID to react to a conversation topic")
        }
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `comment/conversations/${id}/react/`),
            headers: this._jsonHeaders,
            data: {
                reaction: reaction.reaction || 'like',
                reacted: reaction.reacted || true,
                userid,
            }
        }
        return this.request(config).then(result=>{
            return result.data
        });
    }

    /**
     * Get a conversation object
     * @param conversation
     */
    public getConversationByCustomId = (conversation: HasCustomId | string): Promise<ConversationResponse> => {
        // @ts-ignore
        const id = getUrlConversationId(conversation, 'customid');
        const config: AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config, `comment/find/conversation/bycustomid?customid=${id}`),
            headers: this._jsonHeaders,
        }
        return this.request(config).then(result=>{
            return result.data
        });
    }

    /**
     * Deletes a conversation and all the comments in it.
     */
    public deleteConversation = (conversation: HasConversationID | string): Promise<ConversationDeletionResponse> => {
        // @ts-ignore
        const id = getUrlConversationId(conversation);
        // @ts-ignore
        const config: AxiosRequestConfig = {
            method: DELETE,
            url: buildAPI(this._config, `${this._apiExt}/${id}`),
            headers: this._jsonHeaders,
        }
        return this.request(config);
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
        return this.request(config).then(response=>response.data);
    }


    getConversationBatchDetails(conversations: Conversation[] | string[], options?:ConversationBatchListOptions): Promise<ConversationDetailsListResponse> {
        //@ts-ignore
        const ids = [].concat(conversations).map(conversation => {
            //@ts-ignore
            return conversation.conversationid ? conversation.conversationid : conversation;
        })
        const requestOptions:ConversationBatchListOptions = Object.assign({} as ConversationBatchListOptions, options || {});
        const cids = ([] as string[]).concat(requestOptions.cid as string[]).join(',');
        const entities = ([] as string[]).concat(requestOptions.entities as string[]).join(',');
        const config: AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config, `${this._apiExt}/details/batch?ids=${ids.join(',')}${cids ? '&cid='+cids : ''}${entities ?'&entities='+entities : ''}`),
            headers: this._jsonHeaders
        }
        return this.request(config).then(response=>response.data);
    }


}