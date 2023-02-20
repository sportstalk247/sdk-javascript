import { ApiHeaders, ReactionCommand, SportsTalkConfig, UserTokenRefreshFunction } from "../../../models/CommonModels";
import { Conversation, ConversationResponse, ConversationDeletionResponse, ConversationRequest, ConversationListResponse, User, ConversationDetailsListResponse, ConversationBatchListOptions } from "../../../models/CommentsModels";
import { IConversationService } from "../../../API/comments/IConversationService";
import { IUserConfigurable } from "../../../API/Configuration";
/**
 * This is the class that governs the lifecycle of conversations.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
export declare class RestfulConversationService implements IConversationService, IUserConfigurable {
    _config: SportsTalkConfig;
    _apiHeaders: ApiHeaders;
    _jsonHeaders: ApiHeaders;
    _apiExt: string;
    private request;
    /**
     * Create a new comments service
     * @param config
     */
    constructor(config?: SportsTalkConfig);
    getCurrentUser: () => User | null | undefined;
    getUserToken: () => Promise<string>;
    refreshUserToken: () => Promise<string>;
    getTokenExp(): number;
    setUser: (user: User) => void;
    /**
     * Set configuraiton
     * @param config
     */
    setConfig: (config: SportsTalkConfig) => void;
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
     * Create a comments
     * @param settings
     */
    createConversation: (settings: Conversation) => Promise<ConversationResponse>;
    /**
     * Get a conversation object
     * @param conversation
     */
    getConversation: (conversation: Conversation | string) => Promise<ConversationResponse>;
    reactToConversationTopic: (conversation: Conversation | string, reaction?: ReactionCommand, user?: User | undefined) => Promise<ConversationResponse>;
    /**
     * Get a conversation object
     * @param conversation
     */
    getConversationByCustomId: (conversation: Conversation | string) => Promise<ConversationResponse>;
    /**
     * Deletes a conversation and all the comments in it.
     */
    deleteConversation: (conversation: Conversation | string) => Promise<ConversationDeletionResponse>;
    /**
     * List available conversations
     * @param filter
     */
    listConversations: (filter?: ConversationRequest | undefined) => Promise<ConversationListResponse>;
    getConversationBatchDetails(conversations: Conversation[] | string[], options?: ConversationBatchListOptions): Promise<ConversationDetailsListResponse>;
}
