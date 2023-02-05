import { Reaction, SportsTalkConfig, ClientConfig, UserTokenRefreshFunction } from "../../../models/CommonModels";
import { Comment, CommentListResponse, CommentDeletionResponse, CommentRequest, Conversation, Vote, RepliesBatchResponse, CommentResult, User } from "../../../models/CommentsModels";
import { ICommentService } from "../../../API/comments/ICommentService";
import { ReportType } from "../../../models/Moderation";
/**
 * This is the primary comment service, which handles posting and responding to comments.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
export declare class RestfulCommentService implements ICommentService {
    private _config;
    private _conversation;
    private _apiHeaders;
    private _jsonHeaders;
    private _apiExt;
    /**
     * Create a new CommentService
     * @param config
     * @param conversation
     */
    constructor(config?: ClientConfig);
    /**
     * Set config
     * @param config
     * @param conversation
     */
    setConfig: (config: SportsTalkConfig) => SportsTalkConfig;
    /**
     * Sets the user's JWT access token
     * @param userToken
     */
    setUserToken: (userToken: string) => void;
    /**
     * Sets a refreshFunction for the user's JWT token.
     * @param refreshFunction
     */
    setUserTokenRefreshFunction: (refreshFunction: UserTokenRefreshFunction) => void;
    /**
     * Used to ensure we have a user or throw a helpful error.
     * @param user
     * @private
     */
    private _requireUser;
    private _requireConversationId;
    /**
     * build a non-reply comment.
     * @param comment
     * @param user
     * @private
     */
    private _buildUserComment;
    /**
     * Get the current comments. May be null.
     */
    getConversation: () => Conversation | null;
    /**
     * Create a comment
     * @param comment
     * @param user
     * @param replyto
     */
    publishComment: (conversationId: string, comment: Comment | string, user?: User | undefined, replyto?: string | Comment | undefined) => Promise<CommentResult>;
    /**
     * Make a non-reply comment
     * @param comment
     * @private
     */
    private _makeComment;
    /**
     * Create a replyto comment
     * @param comment
     * @param replyTo
     * @private
     */
    private _makeReply;
    /**
     * Get a specific comment.
     * @param comment
     */
    getComment: (conversationId: string, comment: Comment | string) => Promise<CommentResult | null>;
    /**
     * Delete a comment, irrevocable.
     * @param comment
     * @param user
     * @private
     */
    private _finalDelete;
    /**
     * Mark a comment as deleted. This can be recovered by admins later.
     * @param comment
     * @param user
     * @private
     */
    private _markDeleted;
    /**
     * Delete a comment
     * @param comment
     * @param user
     * @param final
     */
    deleteComment: (conversationId: string, comment: Comment | string, user: User, final?: boolean | undefined) => Promise<CommentDeletionResponse>;
    /**
     * Update a comment
     * @param comment
     */
    updateComment: (conversationId: string, comment: CommentResult) => Promise<CommentResult>;
    /**
     *
     * @param comment The comment or comment ID to react to.
     * @param reaction The reaction type.  Currently only "like" is supported and built-in.
     * @param enable Whether the reaction should be toggled on or off, defaults to true.
     */
    react: (conversationId: string, comment: Comment | string, user: User, reaction: Reaction, enable?: boolean) => Promise<CommentResult>;
    /**
     * Vote on a comment
     * @param comment
     * @param user
     * @param vote
     */
    vote: (conversationId: string, comment: Comment, user: User, vote: Vote) => Promise<CommentResult>;
    /**
     * Report a comment to admins for moderation
     * @param comment
     * @param user
     * @param reporttype
     */
    report: (conversationId: string, comment: Comment, user: User, reporttype: ReportType) => Promise<CommentResult>;
    /**
     * Gets the replies for a specific comment
     * @param comment
     * @param request
     */
    getReplies: (conversationId: string, comment: Comment | string, request?: CommentRequest | undefined) => Promise<CommentListResponse>;
    /**
     * Get comments for a comments.
     * @param request
     * @param conversation
     */
    listComments: (conversation: Conversation | string, request?: CommentRequest | undefined) => Promise<CommentListResponse>;
    listRepliesBatch: (conversation: Conversation | string, parentids: string[], childlimit?: number) => Promise<RepliesBatchResponse>;
}
