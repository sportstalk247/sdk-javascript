import {
    ApiHeaders,
    Reaction,
    SportsTalkConfig,
    User,
    ReportType,
    ClientConfig,
    Kind
} from "../../../models/CommonModels";
import {
    Comment, CommentListResponse, CommentDeletionResponse,
    CommentRequest,
    CommentSortMethod,
    Conversation,
    Vote
} from "../../../models/ConversationModels";
import {DELETE, GET, POST, PUT} from "../../constants/api";
import {getUrlEncodedHeaders, getJSONHeaders, buildAPI, formify} from "../../utils";
import {getUrlCommentId, getUrlConversationId} from "../ConversationUtils";
import {RequireUserError, SettingsError, ValidationError} from "../../errors";
import {ICommentService} from "../../../API/ConversationAPI";
import {
    MISSING_REPLYTO_ID,
    MUST_SET_USER,
    MUST_SPECIFY_CONVERSATION,
    NO_CONVERSATION_SET,
    USER_NEEDS_ID
} from "../../constants/messages";

import axios, {AxiosRequestConfig} from "axios";

export class RestfulCommentService implements ICommentService {
    private _config: SportsTalkConfig;
    private _conversation: Conversation;
    private _apiHeaders: ApiHeaders;
    private _jsonHeaders: ApiHeaders;
    private _conversationId: string;
    private _apiExt:string = 'comment/conversations';

    constructor(config?: ClientConfig, conversation?: Conversation) {
        if(conversation) {
            this.setConversation(conversation);
        }
        if(config) {
            this.setConfig(config);
        }
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
            /* istanbul ignore next */
            throw new SettingsError(message || NO_CONVERSATION_SET);
        }
    }

    private _buildUserComment = (comment: Comment | string, user?: User): Comment => {
        let final:any = comment;
        if(typeof comment === 'string') {
            final = {body: comment}
        }
        return <Comment>Object.assign({}, final, user);
    }

    public getConversation = (): Conversation | null => {
        return this._conversation;
    }

    public setConfig = (config: SportsTalkConfig, conversation?: Conversation): SportsTalkConfig => {
        this._config = config;
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiToken)
        this._jsonHeaders = getJSONHeaders(this._config.apiToken);
        if(conversation) {
            this.setConversation(conversation);
        }
        return config;
    }

    public setConversation = (conversation: Conversation): Conversation => {
        this._conversation = conversation;
        this._conversationId = getUrlConversationId(conversation);
        return this._conversation;
    }

    public create = (comment: Comment | string, user?: User, replyto?: Comment | string): Promise<Comment> => {
        // @ts-ignore
        const replyid: Comment | string = replyto || comment.replyto;
        this._requireUser(user || comment );
        this._requireConversation();
        const finalComment = this._buildUserComment(comment, user);
        if(!replyid) {
            return this._makeComment(finalComment);
        }
        return this._makeReply(finalComment, replyid);
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
        });
    }

    private _makeReply = (comment: Comment, replyTo: Comment | string): Promise<Comment> => {
        // @ts-ignore
        const replyId = replyTo.id || replyTo || comment.replyto;
        if(!replyId || !(typeof replyId === 'string')) {
            throw new ValidationError(MISSING_REPLYTO_ID);
        }
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${this._conversationId}/comments/${replyId}`),
            headers: this._jsonHeaders,
            data: {
                body: comment.body,
                userid: comment.userid
            }
        }
        return axios(config).then(result=>{
            return result.data;
        }).catch(e=>{
            throw e;
        });
    }

    public getComment = (comment: Comment | string): Promise<Comment | null> => {
        // @ts-ignore
        this._requireConversation();
        const id = getUrlCommentId(comment);
        const config: AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config, `${this._apiExt}/${this._conversationId}/comments/${id}`),
            headers: this._jsonHeaders,
        }
        return axios(config).then(result=>{
            return result.data.data;
        }).catch(e=>{
            if(e.response.status === 404) {
                return null;
            }
            throw e;
        })
    }

    private _finalDelete = async (comment: Comment | string, user:User): Promise<CommentDeletionResponse> => {
        this._requireConversation();
        const id = getUrlCommentId(comment);
        const config:AxiosRequestConfig = {
            method: DELETE,
            url: buildAPI(this._config, `${this._apiExt}/${this._conversationId}/comments/${id}`),
            headers: this._jsonHeaders,
        }
        const result = await axios(config);
        return result.data.data;
    }

    private _markDeleted = async (comment: Comment | string, user:User): Promise<CommentDeletionResponse> => {
        this._requireUser(user);
        const id = getUrlCommentId(comment);
        /* istanbul ignore next */
        const config:AxiosRequestConfig = {
            method: PUT,
            url: buildAPI(this._config, `${this._apiExt}/${this._conversationId}/comments/${id}/setdeleted?userid=${user.userid}&deleted=true`),
            headers: this._jsonHeaders,
        }

        return axios(config).then(result => {
            const comment:Comment = result.data.data;
            // @ts-ignore
            const response: CommentDeletionResponse = {
                kind: Kind.deletedcomment,
                conversationid: comment.conversationid,
                commentid: <string>comment.id,
                deletedComments: 1
            }
            return response;
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
            url: buildAPI(this._config,`${this._apiExt}/${this._conversationId}/comments/${id}`),
            headers: this._jsonHeaders,
            data: {
                body: comment.body,
                userid: comment.userid
            }
        }).then(result=>{
            return result.data.data;
        });
    }
    /**
     *
     * @param comment The comment or comment ID to react to.
     * @param reaction The reaction type.  Currently only "like" is supported and built-in.
     * @param enable Whether the reaction should be toggled on or off, defaults to true.
     */
    public react = (comment:Comment | string, user:User, reaction:Reaction, enable = true): Promise<Comment> => {
        this._requireConversation();
        this._requireUser(user);
        const id = getUrlCommentId(comment);
        const data = {
            userid : user.userid,
            reaction : reaction,
            reacted : enable ? true : false // null protection.
        }
        const config:AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${this._conversationId}/comments/${id}/react`),
            headers: this._jsonHeaders,
            data
        }
        return axios(config).then(result=>{
            return result.data.data
        });
    }

    public vote = (comment: Comment, user:User, vote:Vote): Promise<Comment> => {
        this._requireConversation();
        this._requireUser(user);
        const id = getUrlCommentId(comment);
        return axios({
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${this._conversationId}/comments/${id}/vote`),
            headers: this._jsonHeaders,
            data: {
                vote: vote,
                userid: user.userid
            }
        }).then(result=>{
            return result.data.data;
        });
    }

    public report = (comment: Comment, user:User, reporttype: ReportType): Promise<Comment> => {
        this._requireConversation();
        this._requireUser(user)
        const id = getUrlCommentId(comment);
        return axios({
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${this._conversationId}/comments/${id}/report`),
            headers: this._jsonHeaders,
            data: {
                reporttype: reporttype,
                userid: user.userid
            }
        }).then(result=>{
            return result.data;
        });
    }

    public getReplies = (comment: Comment, request?: CommentRequest): Promise<CommentListResponse> =>{
        this._requireConversation();
        const id = getUrlCommentId(comment);
        const requestString = formify(request);
        return axios({
            method: GET,
            url: buildAPI(this._config, `${this._apiExt}/${this._conversationId}/comments/${id}/replies/?${requestString}`),
            headers: this._jsonHeaders,
            data: request
        }).then(result=>{
            return {
                conversation: result.data.data.conversation,
                comments: result.data.data.comments
            }
        });
    }

    public getComments = (request?: CommentRequest, conversation?: Conversation): Promise<CommentListResponse>=> {
        if(!conversation) {
            this._requireConversation(MUST_SPECIFY_CONVERSATION);
        }
        const id = conversation ? getUrlConversationId(conversation) : this._conversationId;
        if(!id) {
           throw new SettingsError(NO_CONVERSATION_SET);
        }
        const config: AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config, `${this._apiExt}/${id}/comments`, request),
            headers: this._jsonHeaders,
        }
        return axios(config).then(result => {
            const {conversation, comments, cursor} = result.data.data;
            return {
                conversation,
                comments,
                cursor
            };
        });
    }
}