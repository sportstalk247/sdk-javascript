import {ApiHeaders, Reaction, SportsTalkConfig, User, ReportType} from "../../../models/CommonModels";
import {
    Comment, Commentary, CommentDeletionResponse,
    CommentRequest,
    CommentSortMethod,
    Conversation,
    ReactionResponse,
    Vote
} from "../../../models/ConversationModels";
import {DELETE, GET, POST, PUT} from "../../../constants/api";
import {getUrlEncodedHeaders, getJSONHeaders, buildAPI} from "../../utils";
import {getUrlCommentId, getUrlConversationId} from "../ConversationUtils";
import {RequireUserError, SettingsError, ValidationError} from "../../errors";
import {ICommentManager} from "../../../API/ConversationAPI";
import {
    MISSING_REPLYTO_ID,
    MUST_SET_USER,
    MUST_SPECIFY_CONVERSATION,
    NO_CONVERSATION_SET,
    USER_NEEDS_HANDLE,
    USER_NEEDS_ID
} from "../../../constants/messages";

import axios, {AxiosRequestConfig} from "axios";

export class RestfulCommentManager implements ICommentManager {
    private _config: SportsTalkConfig;
    private _conversation: Conversation;
    private _apiHeaders: ApiHeaders;
    private _jsonHeaders: ApiHeaders;
    private _conversationId: string;
    private _apiExt:string = 'comment/conversations';

    private static DEFAULT_COMMENT_REQUEST: CommentRequest = {
        includechilden: false,
        sort: CommentSortMethod.oldest
    }

    private _requireUser = (user) => {
        if(!user) {
            throw new RequireUserError(MUST_SET_USER);
        }
        if(!user.userid) {
            throw new RequireUserError(USER_NEEDS_ID);
        }
    }
    private _requireConversation = (message?:string) => {
        if(!this._conversationId) {
            throw new SettingsError(message || NO_CONVERSATION_SET);
        }
    }

    private _buildUserComment = (comment: Comment | string, user: User): Comment => {
        // @ts-ignore
        if(comment.userid && comment.body) {
            return <Comment>comment;
        } else {
            return <Comment>Object.assign({}, user, {body: comment});
        }
    }

    constructor(conversation?: Conversation, config?: SportsTalkConfig) {
        if(conversation) {
            this.setConversation(conversation);
        }
        if(config) {
            this.setConfig(config);
        }
    }

    public getConversation = (): Conversation | null => {
        return this._conversation;
    }

    public setConfig = (config: SportsTalkConfig, conversation?: Conversation): SportsTalkConfig => {
        this._config = config;
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiKey)
        this._jsonHeaders = getJSONHeaders(this._config.apiKey);
        if(conversation) {
            this.setConversation(conversation);
        }
        return config;
    }

    public setConversation = (conversation: Conversation): Conversation => {
        this._conversation = conversation;
        this._conversationId = getUrlConversationId(conversation);
        return conversation
    }

    public create = (comment: Comment | string, user: User, replyto?: Comment | string): Promise<Comment> => {
        this._requireUser(user);
        this._requireConversation();
        const finalComment = this._buildUserComment(comment, user);
        if(!replyto) {
            return this._makeComment(finalComment);
        }
        return this._makeReply(finalComment, replyto);
    }

    private _makeComment = (comment: Comment): Promise<Comment> => {
        const config:AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${this._conversationId}/comments`),
            headers: this._jsonHeaders,
            data: comment
        }
        return axios(config).then(result=>{
            return result.data.data;
        }).catch(e=>{
            throw e;
        })
    }

    private _makeReply = (comment: Comment, replyTo: Comment | string): Promise<Comment> => {
        // @ts-ignore
        const replyId = replyTo.id || replyTo || comment.replyto;
        if(!replyId) {
            throw new ValidationError(MISSING_REPLYTO_ID);
        }
        return axios({
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${this._conversationId}/${replyId}`),
            headers: this._jsonHeaders,
            data: {
                body: comment.body,
                userid: comment.userid
            }
        }).then(result=>{
            return result.data;
        });
    }

    public get = (comment: Comment | string): Promise<Comment> => {
        // @ts-ignore
        this._requireConversation();
        const id = getUrlCommentId(comment);
        return axios({
            method: GET,
            url: buildAPI(this._config, `${this._apiExt}/${this._conversationId}/${id}`),
            headers: this._jsonHeaders,
        }).then(result=>{
            return result.data;
        });
    }

    private _finalDelete = (comment: Comment | string, user:User): Promise<CommentDeletionResponse> => {
        this._requireConversation();
        const id = getUrlCommentId(comment);
        return axios({
            method: DELETE,
            url: buildAPI(this._config, `${this._apiExt}/${this._conversationId}/${id}`),
            headers: this._jsonHeaders,
        }).then(result => {
            return result.data;
        });
    }

    private _markDeleted = async (comment: Comment | string, user:User): Promise<CommentDeletionResponse> => {
        this._requireUser(user);
        const id = getUrlCommentId(comment);
        const config:AxiosRequestConfig = {
            method: PUT,
            url: buildAPI(this._config, `${this._apiExt}/${this._conversationId}/${id}?userid=${user.userid}&deleted=true`),
            headers: this._jsonHeaders,
        }
        return axios(config).then(result => {
            return result.data;
        });
    }
    public delete = (comment: Comment | string, user: User, final?: boolean): Promise<CommentDeletionResponse> => {
        if(final) {
            return this._finalDelete(comment, user);
        }
        return this._markDeleted(comment, user);
    }

    public update = (comment: Comment): Promise<Comment> => {
        this._requireConversation();
        const id = getUrlCommentId(comment);
        return axios({
            method: PUT,
            url: buildAPI(this._config,`${this._apiExt}/${this._conversationId}/${id}`),
            headers: this._jsonHeaders,
            data: {
                body: comment.body,
                userid: comment.userid
            }
        }).then(result=>{
            return result.data;
        });
    }
    /**
     *
     * @param comment The comment or comment ID to react to.
     * @param reaction The reaction type.  Currently only "like" is supported and built-in.
     * @param enable Whether the reaction should be toggled on or off, defaults to true.
     */
    public react = (comment:Comment | string, user:User, reaction:Reaction, enable = true): Promise<ReactionResponse> => {
        this._requireConversation();
        this._requireUser(user);
        const id = getUrlCommentId(comment);
        const data = {
            userid : user.userid,
            reaction : reaction,
            reacted : enable ? true : false // null protection.
        }
        return axios({
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${this._conversationId}/${id}/react`),
            headers: this._jsonHeaders,
            data
        }).then(result=>{
            return result.data;
        });
    }

    public vote = (comment: Comment, user:User, vote:Vote) => {
        this._requireConversation();
        this._requireUser(user);
        const id = getUrlCommentId(comment);
        return axios({
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${this._conversationId}/${id}/vote`),
            headers: this._jsonHeaders,
            data: {
                vote: vote,
                userid: user.userid
            }
        }).then(result=>{
            return result.data;
        });
    }

    public report = (comment: Comment, user:User, reporttype: ReportType) => {
        this._requireConversation();
        this._requireUser(user)
        const id = getUrlCommentId(comment);
        return axios({
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${this._conversationId}/${id}/report`),
            headers: this._jsonHeaders,
            data: {
                reporttype: reporttype,
                userid: user.userid
            }
        }).then(result=>{
            return result.data;
        });
    }

    public getReplies = (comment: Comment, request?: CommentRequest): Promise<Array<Comment>> =>{
        this._requireConversation();
        const id = getUrlCommentId(comment);
        return axios({
            method: GET,
            url: buildAPI(this._config, `${this._apiExt}/${this._conversationId}/${id}`),
            headers: this._jsonHeaders,
            data: request
        }).then(result=>{
            return result.data;
        });
    }

    public getComments = (request?: CommentRequest, conversation?: Conversation): Promise<Commentary>=> {
        if(!conversation) {
            this._requireConversation(MUST_SPECIFY_CONVERSATION);
        }
        const id = conversation ? getUrlConversationId(conversation) : this._conversationId;
        if(!id) {
           throw new SettingsError(NO_CONVERSATION_SET);
        }
        return axios({
            method: GET,
            url: buildAPI(this._config, `${this._apiExt}/${id}/comments`, request),
            headers: this._jsonHeaders,
        }).then(result=>{
            const {conversation, comments} = result.data.data;
            return {
                conversation,
                comments
            };
        });
    }
}