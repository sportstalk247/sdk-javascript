import { Reaction, SportsTalkConfig, UserTokenRefreshFunction, ListRequest } from "../models/CommonModels";
import { Conversation, Vote, Comment, CommentRequest, ConversationDeletionResponse, ConversationResponse, CommentListResponse, CommentDeletionResponse, ConversationRequest, ConversationListResponse, RepliesBatchResponse, CommentResult, User, ConversationDetailsListResponse, ConversationBatchListOptions } from "../models/CommentsModels";
import { ICommentService } from "../API/comments/ICommentService";
import { IConversationService } from "../API/comments/IConversationService";
import { ICommentingClient } from "../API/comments/ICommentingClient";
import { UserDeletionResponse, UserListResponse, UserResult, UserSearchType } from "../models/user/User";
import { ReportType } from "../models/Moderation";
/**
 * This is the API client for the Conversations feature.
 * For most implementations, this is the main class you will be using.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
export declare class CommentClient implements ICommentingClient {
    /**
     * Holds the config object
     * @private
     */
    private _config;
    /**
     * Used to create a holder for callbacks that will propagate to sub-modules.
     * @private
     */
    private _callbackDelegate;
    /**
     * Holds the ConversationService powering the client
     * @private
     */
    private _conversationService;
    /**
     * Holds the CommentService powering the client
     * @private
     */
    private _commentService;
    /**
     * Holds the UserService powering the CommentClient
     * @private
     */
    private _userService;
    /**
     * The current user
     * @private
     */
    private _user;
    /**
     * Holds the current conversation state.
     * @private
     */
    private _currentConversation;
    /**
     * Default settings for comment requests.
     * @private
     */
    private _defaultCommentRequest;
    /**
     * Creates a new Conversation Client
     * @param SportsTalkConfig
     * @param initialConversation Either a comments object or a comments id
     * @param commentService optional and here for future extension for custom implementations of the comment service.
     * @param conversationService optional and here for future extension for cusstom implementations of the comments service.
     */
    static init(config: SportsTalkConfig, initialConversation?: Conversation | string, commentService?: IConversationService, conversationService?: IConversationService): CommentClient;
    private constructor();
    getTokenExp(): number;
    /**
     * Get the current configuration object
     * @return SportsTalkConfig
     */
    getConfig: () => SportsTalkConfig;
    /**
     * Gets the user's access token. If unset returns an empty string.
     */
    getUserToken: () => Promise<string>;
    /**
     * Sets the user's JWT access token
     * @param userToken
     */
    setUserToken: (userToken: string) => void;
    /**
     * Sets a refreshFunction for the user's JWT token.
     * @param refreshFunction
     */
    setUserTokenRefreshFunction: (userTokenRefreshFunction: UserTokenRefreshFunction) => void;
    /**
     * Refreshes the user's access token.  You MUST have already set a user access token AND registered a refresh function.
     * If the refresh function fails to refresh the token, there is no token, or there is an error, this will not refresh the token and throws an error.
     */
    refreshUserToken: () => Promise<string>;
    /**
     * Set the current user for commands
     * @param user
     */
    setUser: (user: User, userToken?: string | undefined) => void;
    /**
     * Get the current user.
     */
    getCurrentUser: () => User;
    /**
     * Set configuration.
     * @param config
     * @param commentService optional, for future extension by custom implementation.
     * @param conversationService optional, for future extension by custom implementation.
     */
    setConfig: (config: SportsTalkConfig, commentService?: ICommentService | undefined, conversationService?: IConversationService | undefined) => void;
    /**
     * Create a new comments.
     * @param conversation the comments to create
     * @param setDefault if set to true (default) will set this comments as the current comments used by other API calls.
     */
    createConversation: (conversation: Conversation, setDefault?: boolean) => Promise<ConversationResponse>;
    /**
     * Returns a conversation if it already exists, otherwise creates it and sets it as default.
     * Does NOT update a conversation's settings if it already exists.  Settings should be primarily managed from the dashboard.
     * @param conversation
     */
    ensureConversation: (conversation: Conversation) => Promise<Conversation>;
    /**
     * Get the default comments
     * @param conversation
     */
    setCurrentConversation: (conversation: Conversation | string) => Conversation | string;
    /**
     * Returns the current default comments
     * @return conversation a Conversation object, a string for the conversationID, or null.
     */
    getCurrentConversation: () => Conversation | string | null;
    /**
     * Retrieves a comments from the server
     * @param conversation
     */
    getConversation: (conversation: Conversation | string) => Promise<Conversation>;
    getConversationByCustomId(conversation: Conversation | string): Promise<ConversationResponse>;
    /**
     * Deletes a comments. Be careful. Cannot be reversed
     * @param conversation
     */
    deleteConversation: (conversation: Conversation | string) => Promise<ConversationDeletionResponse>;
    /**
     *
     * @param comment The comment string or Comment object
     * @param replyto either the comment object to reply to or the ID as a string
     */
    publishComment: (comment: string | Comment, replyto?: string | Comment | undefined) => Promise<CommentResult>;
    /**
     * Retrieves a specific comment
     * @param comment
     */
    getComment: (comment: CommentResult | string) => Promise<CommentResult | null>;
    /**
     * If the user exists, updates the user. Otherwise creates a new user.
     * @param user a User model.  The values of 'banned', 'handlelowercase' and 'kind' are ignored.
     */
    createOrUpdateUser: (user: User, setDefault?: boolean) => Promise<UserResult>;
    /**
     * Deletes a comment
     * @param comment
     * @param final
     */
    deleteComment: (comment: CommentResult | string, final: boolean) => Promise<CommentDeletionResponse>;
    /**
     * Update a comment that already exists
     * @param comment
     */
    updateComment: (comment: CommentResult) => Promise<Comment>;
    /**
     * Issues a comment reaction.
     * @param comment
     * @param reaction
     */
    reactToComment: (comment: CommentResult, reaction: Reaction) => Promise<Comment>;
    /**
     * Votes on a comment
     * @param comment
     * @param vote
     */
    voteOnComment: (comment: CommentResult | string, vote: Vote) => Promise<CommentResult>;
    /**
     * Report a comment for violating the rules
     * @param comment
     * @param reportType
     */
    reportComment: (comment: CommentResult, reportType: ReportType) => Promise<Comment>;
    /**
     * Get replies to a specific comment
     * @param comment
     * @param request
     */
    getCommentReplies: (comment: CommentResult | string, request?: CommentRequest | undefined) => Promise<CommentListResponse>;
    listRepliesBatch: (parentids: string[], limit?: number) => Promise<RepliesBatchResponse>;
    /**
     * Retrieves comments
     * @param request how to sort/filter the comments.  See CommentRequest
     * @param conversation optional, if removed will retrieve the comments for the comments set with `setConversation()`
     */
    listComments: (request?: CommentRequest | undefined, conversation?: Conversation | undefined) => Promise<CommentListResponse>;
    /**
     * List available conversations
     * @param filter a conversationrequest, currently allows you to filter only by property.
     */
    listConversations: (filter?: ConversationRequest | undefined) => Promise<ConversationListResponse>;
    setBanStatus: (user: User | string, isBanned: boolean) => Promise<UserResult>;
    searchUsers: (search: string, type: UserSearchType, limit?: number | undefined) => Promise<UserListResponse>;
    listUsers: (request?: ListRequest | undefined) => Promise<UserListResponse>;
    deleteUser: (user: User | string) => Promise<UserDeletionResponse>;
    getUserDetails: (user: User | string) => Promise<UserResult>;
    getConversationBatchDetails: (conversations: Conversation[] | string[], options?: ConversationBatchListOptions | undefined) => Promise<ConversationDetailsListResponse>;
}
