import {ApiHeaders, Reaction, SportsTalkConfig, User} from "../../../models/CommonModels";
import {
    Comment, CommentDeletionResponse,
    CommentRequest,
    CommentSortMethod,
    Conversation,
    ReactionResponse,
    ReportType, ShortComment,
    Vote
} from "../../../models/ConversationModels";
import {DELETE, GET, POST} from "../../../constants";
import {getUrlEncodedHeaders, getJSONHeaders} from "../../../utils";
import {getUrlCommentId, getUrlConversationId} from "../ConversationUtils";
import {RequireUserError, SettingsError, ValidationError} from "../../../errors";
import {ICommentManager} from "../../../API/ConversationAPI";
import {
    MISSING_REPLYTO_ID,
    MUST_SET_USER,
    NO_CONVERSATION_SET,
    USER_NEEDS_HANDLE,
    USER_NEEDS_ID
} from "../../../messages";

import axios from "axios";

export class RestfulCommentManager implements ICommentManager {
    private _config: SportsTalkConfig;
    private _conversation: Conversation;
    private _apiHeaders: ApiHeaders;
    private _jsonHeaders: ApiHeaders;
    private _conversationId: string;
    private _user: User;

    private static DEFAULT_COMMENT_REQUEST: CommentRequest = {
        includechilden: false,
        sort: CommentSortMethod.oldest
    }

    private _requireUser = () => {
        if(!this._user) {
            throw new RequireUserError(MUST_SET_USER);
        }
        if(!this._user.userid) {
            throw new RequireUserError(USER_NEEDS_ID);
        }
        if(!this._user.handle) {
            throw new RequireUserError(USER_NEEDS_HANDLE);
        }
    }
    private _requireConversation = () => {
        if(!this._conversationId) {
            throw new SettingsError(NO_CONVERSATION_SET);
        }
    }

    private _buildUserComment = (comment: Comment | string): Comment => {
        // @ts-ignore
        if(comment.userid && comment.body) {
            return <Comment>comment;
        } else {
            return <Comment>Object.assign({}, this._user, {body: comment});
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

    public setUser = (user:User) => {
        this._user = user;
    }
    public getConversation = (): Conversation | null => {
        return this._conversation;
    }

    public setConfig = (config: SportsTalkConfig, conversation?: Conversation): SportsTalkConfig => {
        this._config = config;
        this._user = config.user || this._user;
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

    public create = (comment: Comment | string, replyto?: Comment | string): Promise<Comment> => {
        this._requireUser();
        this._requireConversation();
        const finalComment = this._buildUserComment(comment);
        if(!replyto) {
            return this._makeComment(finalComment);
        }
        return this._makeReply(finalComment, replyto);
    }

    private _makeComment = (comment: Comment): Promise<Comment> => {
        return axios({
            method: POST,
            url: `${this._config.endpoint}/comment/${this._conversationId}`,
            headers: this._jsonHeaders,
            data: comment
        }).then(result=>{
            return result.data;
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
        const replyComment: Comment = Object.assign(comment, {replyto: replyId});
        return axios({
            method: POST,
            url: `${this._config.endpoint}/comment/${this._conversationId}`,
            headers: this._jsonHeaders,
            data: replyComment
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
            url: `${this._config.endpoint}/comment/${this._conversationId}/${id}`,
            headers: this._jsonHeaders,
        }).then(result=>{
            return result.data;
        });
    }

    public delete = (comment: Comment | string): Promise<CommentDeletionResponse> => {
        this._requireConversation();
        const id = getUrlCommentId(comment);
        return axios({
            method: DELETE,
            url: `${this._config.endpoint}/comment/${this._conversationId}/${id}`,
            headers: this._jsonHeaders,
        }).then(result=>{
            return result.data;
        });
    }

    public update = (comment: Comment): Promise<Comment> => {
        this._requireConversation();
        const id = getUrlCommentId(comment);
        return axios({
            method: GET,
            url: `${this._config.endpoint}/comment/${this._conversationId}/${id}`,
            headers: this._jsonHeaders,
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
    public react = (comment:Comment | string, reaction:Reaction, enable = true): Promise<ReactionResponse> => {
        this._requireConversation();
        this._requireUser();
        const id = getUrlCommentId(comment);
        const data = {
            userid : this._user.userid,
            reaction : reaction,
            reacted : enable ? true : false // null protection.
        }
        return axios({
            method: POST,
            url: `${this._config.endpoint}/comment/${this._conversationId}/${id}/react`,
            headers: this._jsonHeaders,
            data
        }).then(result=>{
            return result.data;
        });
    }

    public vote = (comment: Comment, vote:Vote) => {
        this._requireConversation();
        this._requireUser();
        const id = getUrlCommentId(comment);
        return axios({
            method: POST,
            url: `${this._config.endpoint}/comment/${this._conversationId}/${id}/react`,
            headers: this._jsonHeaders,
            data: {
                vote: vote,
                userid: this._user.userid
            }
        }).then(result=>{
            return result.data;
        });
    }

    public report = (comment: Comment, reporttype: ReportType) => {
        this._requireConversation();
        this._requireUser();
        const id = getUrlCommentId(comment);
        return axios({
            method: POST,
            url: `${this._config.endpoint}/comment/${this._conversationId}/${id}/report`,
            headers: this._jsonHeaders,
            data: {
                reporttype: reporttype,
                userid: this._user.userid
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
            url: `${this._config.endpoint}/comment/${this._conversationId}/${id}`,
            headers: this._jsonHeaders,
            data: request
        }).then(result=>{
            return result.data;
        });
    }

    public getComments = (request?: CommentRequest, conversation?: Conversation): Promise<Array<Comment>> => {
        const id = conversation ? getUrlConversationId(conversation) : this._conversationId;
        if(!id) {
           throw new SettingsError(NO_CONVERSATION_SET);
        }
        return axios({
            method: GET,
            url: `${this._config.endpoint}/comment/${id}`,
            headers: this._jsonHeaders,
            data: request
        }).then(result=>{
            return result.data;
        });
    }
}