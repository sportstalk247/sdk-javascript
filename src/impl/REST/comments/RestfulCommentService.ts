import {
    ApiHeaders,
    Reaction,
    SportsTalkConfig,
    ClientConfig,
    Kind
} from "../../../models/CommonModels";
import {
    Comment, CommentListResponse, CommentDeletionResponse,
    CommentRequest,
    Conversation,
    Vote, RepliesBatchResponse, CommentResult, User
} from "../../../models/CommentsModels";
import {DELETE, GET, POST, PUT} from "../../constants/api";
import {getUrlEncodedHeaders, getJSONHeaders, buildAPI, formify} from "../../utils";
import {getUrlCommentId, getUrlConversationId} from "./ConversationUtils";
import {RequireUserError, SettingsError, ValidationError} from "../../errors";
import {
    MISSING_REPLYTO_ID,
    MUST_SET_USER,
    MUST_SPECIFY_CONVERSATION,
    NO_CONVERSATION_SET,
    USER_NEEDS_ID
} from "../../constants/messages";

import {AxiosRequestConfig} from "axios";
import {stRequest} from "../../network";
import {ICommentService} from "../../../API/comments/ICommentService";
import {ReportType} from "../../../models/Moderation";

/**
 * This is the primary comment service, which handles posting and responding to comments.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
export class RestfulCommentService implements ICommentService {
    private _config: SportsTalkConfig;
    private _conversation: Conversation;
    private _apiHeaders: ApiHeaders;
    private _jsonHeaders: ApiHeaders;
    private _apiExt:string = 'comment/conversations';

    /**
     * Create a new CommentService
     * @param config
     * @param conversation
     */
    constructor(config?: ClientConfig) {
        if(config) {
            this.setConfig(config);
        }
    }

    /**
     * Set config
     * @param config
     * @param conversation
     */
    public setConfig = (config: SportsTalkConfig): SportsTalkConfig => {
        this._config = config;
        this._apiHeaders = getUrlEncodedHeaders(this._config.apiToken, this._config.userToken)
        this._jsonHeaders = getJSONHeaders(this._config.apiToken, this._config.userToken);
        return config;
    }

    /**
     * Used to ensure we have a user or throw a helpful error.
     * @param user
     * @private
     */
    private _requireUser = (user) => {
        if(!user) {
            throw new RequireUserError(MUST_SET_USER);
        }
        if(!user.userid) {
            throw new RequireUserError(USER_NEEDS_ID);
        }
    }

    private _requireConversationId = (id:string) => {
        if(!id) {
            throw new ValidationError(NO_CONVERSATION_SET);
        }
    }

    /**
     * build a non-reply comment.
     * @param comment
     * @param user
     * @private
     */
    private _buildUserComment = (comment: Comment | string, user?: User): Comment => {
        let final:any = comment;
        if(typeof comment === 'string') {
            final = {body: comment}
        }
        return <Comment>Object.assign({}, final, user);
    }

    /**
     * Get the current comments. May be null.
     */
    public getConversation = (): Conversation | null => {
        return this._conversation;
    }
    /**
     * Create a comment
     * @param comment
     * @param user
     * @param replyto
     */
    public publishComment = (conversationId:string , comment: Comment | string, user?: User, replyto?: Comment | string): Promise<CommentResult> => {
        this._requireConversationId(conversationId);
        // @ts-ignore
        const replyid: Comment | string = replyto || comment.replyto;
        this._requireUser(user || comment );
        const finalComment = this._buildUserComment(comment, user);
        if(!replyid) {
            return this._makeComment(conversationId, finalComment);
        }
        return this._makeReply(conversationId, finalComment, replyid);
    }

    /**
     * Make a non-reply comment
     * @param comment
     * @private
     */
    private _makeComment = (conversationId:string, comment: Comment): Promise<CommentResult> => {
        const config:AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${conversationId}/comments`),
            headers: this._jsonHeaders,
            data: comment
        }
        return stRequest(config).then(result=>{
            return result.data;
        });
    }

    /**
     * Create a replyto comment
     * @param comment
     * @param replyTo
     * @private
     */
    private _makeReply = (conversationId: string, comment: Comment, replyTo: Comment | string): Promise<CommentResult> => {
        // @ts-ignore
        const replyId = replyTo.id || replyTo || comment.replyto;
        if(!replyId || !(typeof replyId === 'string')) {
            throw new ValidationError(MISSING_REPLYTO_ID);
        }
        const config: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${conversationId}/comments/${replyId}`),
            headers: this._jsonHeaders,
            data: comment
        }

        return stRequest(config).then(result=>{
            return result.data;
        }).catch(e=>{
            throw e;
        });
    }

    /**
     * Get a specific comment.
     * @param comment
     */
    public getComment = ( conversationId: string, comment: Comment | string,): Promise<CommentResult | null> => {
        this._requireConversationId(conversationId);
        const id = getUrlCommentId(comment);
        const config: AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config, `${this._apiExt}/${conversationId}/comments/${id}`),
            headers: this._jsonHeaders,
        }
        return stRequest(config).then(result=>{
            return result.data;
        }).catch(e=>{
            if(e.response.status === 404) {
                return null;
            }
            throw e;
        })
    }

    /**
     * Delete a comment, irrevocable.
     * @param comment
     * @param user
     * @private
     */
    private _finalDelete = async (conversationId: string,comment: Comment | string, user:User): Promise<CommentDeletionResponse> => {
        const id = getUrlCommentId(comment);
        const config:AxiosRequestConfig = {
            method: DELETE,
            url: buildAPI(this._config, `${this._apiExt}/${conversationId}/comments/${id}`),
            headers: this._jsonHeaders,
        }
        const result = await stRequest(config);
        return result.data;
    }

    /**
     * Mark a comment as deleted. This can be recovered by admins later.
     * @param comment
     * @param user
     * @private
     */
    private _markDeleted = async (conversationId: string, comment: Comment | string, user:User,): Promise<CommentDeletionResponse> => {
        this._requireUser(user);
        const id = getUrlCommentId(comment);
        /* istanbul ignore next */
        const config:AxiosRequestConfig = {
            method: PUT,
            url: buildAPI(this._config, `${this._apiExt}/${conversationId}/comments/${id}/setdeleted?userid=${user.userid}&deleted=true&permanentifnoreplies=false`),
            headers: this._jsonHeaders,
        }

        return stRequest(config).then(result => {
            const comment:Comment = result.data;
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

    /**
     * Delete a comment
     * @param comment
     * @param user
     * @param final
     */
    public deleteComment = (conversationId: string, comment: Comment | string, user: User, final?: boolean): Promise<CommentDeletionResponse> => {
        this._requireConversationId(conversationId);
        if(final) {
            return this._finalDelete( conversationId, comment, user);
        }
        return this._markDeleted(conversationId, comment, user);
    }

    /**
     * Update a comment
     * @param comment
     */
    public updateComment = ( conversationId: string, comment: CommentResult): Promise<CommentResult> => {
        this._requireConversationId(conversationId);
        const id = getUrlCommentId(comment);
        return stRequest({
            method: PUT,
            url: buildAPI(this._config,`${this._apiExt}/${conversationId}/comments/${id}`),
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
    public react = (conversationId: string, comment:Comment | string, user:User, reaction:Reaction,enable = true): Promise<CommentResult> => {
        this._requireConversationId(conversationId);
        this._requireUser(user);
        const id = getUrlCommentId(comment);
        const data = {
            userid : user.userid,
            reaction : reaction,
            reacted : enable ? true : false // null protection.
        }
        const config:AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${conversationId}/comments/${id}/react`),
            headers: this._jsonHeaders,
            data
        }
        return stRequest(config).then(result=>{
            return result.data;
        });
    }

    /**
     * Vote on a comment
     * @param comment
     * @param user
     * @param vote
     */
    public vote = ( conversationId: string, comment: Comment, user:User, vote:Vote): Promise<CommentResult> => {
        this._requireConversationId(conversationId);
        this._requireUser(user);
        const id = getUrlCommentId(comment);
        const request: AxiosRequestConfig = {
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${conversationId}/comments/${id}/vote`),
            headers: this._jsonHeaders,
            data: {
                vote: vote,
                userid: user.userid
            }
        };
        return stRequest(request).then(result=>{
            return result.data;
        });
    }

    /**
     * Report a comment to admins for moderation
     * @param comment
     * @param user
     * @param reporttype
     */
    public report = ( conversationId: string, comment: Comment, user:User, reporttype: ReportType): Promise<CommentResult> => {
        this._requireConversationId(conversationId);
        this._requireUser(user)
        const id = getUrlCommentId(comment);
        return stRequest({
            method: POST,
            url: buildAPI(this._config, `${this._apiExt}/${conversationId}/comments/${id}/report`),
            headers: this._jsonHeaders,
            data: {
                reporttype: reporttype,
                userid: user.userid
            }
        }).then(result=>{
            return result.data;
        });
    }

    /**
     * Gets the replies for a specific comment
     * @param comment
     * @param request
     */
    public getReplies = (conversationId: string, comment: Comment | string, request?: CommentRequest): Promise<CommentListResponse> =>{
        this._requireConversationId(conversationId);
        const id = getUrlCommentId(comment);
        const requestString = formify(request);
        return stRequest({
            method: GET,
            url: buildAPI(this._config, `${this._apiExt}/${conversationId}/comments/${id}/replies/?${requestString}`),
            headers: this._jsonHeaders,
            data: request
        }).then(result=>{
            return {
                conversation: result.data.conversation,
                comments: result.data.comments
            }
        });
    }

    /**
     * Get comments for a comments.
     * @param request
     * @param conversation
     */
    public listComments = (conversation: Conversation | string, request?: CommentRequest): Promise<CommentListResponse>=> {
        if(!conversation) {
            throw new ValidationError(MUST_SPECIFY_CONVERSATION);
        }
        const id = getUrlConversationId(conversation);
        this._requireConversationId(id);
        const config: AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config, `${this._apiExt}/${id}/comments`, request),
            headers: this._jsonHeaders,
        }
        return stRequest(config).then(result => {
            const {conversation, comments, cursor, more} = result.data;
            return {
                conversation,
                comments,
                cursor,
                more
            };
        });
    }

    public listRepliesBatch = (conversation: Conversation | string, parentids: string[], childlimit:number = 50): Promise<RepliesBatchResponse> => {
        const id = getUrlConversationId(conversation);
        this._requireConversationId(id);
        if(!parentids || !parentids.length) {
            throw new ValidationError('Must provide a list of parent comment IDs');
        }
        const config: AxiosRequestConfig = {
            method: GET,
            url: buildAPI(this._config, `${this._apiExt}/${id}/repliesbyparentidbatch`, {parentids, childlimit}),
            headers: this._jsonHeaders,
        }
        return stRequest(config).then(resp=>resp.data);
    }
}
