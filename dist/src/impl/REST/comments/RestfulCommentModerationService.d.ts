import { SportsTalkConfig, UserTokenRefreshFunction } from "../../../models/CommonModels";
import { Comment, CommentListResponse, CommentResult } from "../../../models/CommentsModels";
import { ICommentModerationService } from "../../../API/comments/ICommentModerationService";
/**
 * Primary REST class for moderating comments.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
export declare class RestfulCommentModerationService implements ICommentModerationService {
    private _config;
    private _apiHeaders;
    private _jsonHeaders;
    private _apiExt;
    constructor(config?: SportsTalkConfig);
    /**
     * Used to ensure we have an appID for operations
     * @private
     */
    private _requireAppId;
    /**
     * Get current config.
     */
    getConfig: () => SportsTalkConfig;
    /**
     * Set configuration
     * @param config
     */
    setConfig: (config?: SportsTalkConfig) => void;
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
     * Get the moderation queue
     */
    listCommentsInModerationQueue: (cursor?: string) => Promise<CommentListResponse>;
    /**
     * Reject a comment, removing it from the comments
     * @param comment
     */
    rejectComment: (comment: CommentResult) => Promise<CommentResult>;
    /**
     * Moderate a comment
     * @param comment
     */
    moderateComment: (comment: CommentResult, approve: boolean) => Promise<CommentResult>;
    /**
     * Approve a comment, allowing it to show in a comments.
     * @param comment
     */
    approveComment: (comment: Comment) => Promise<CommentResult>;
}
