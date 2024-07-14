import {
    Reaction,
    SportsTalkConfig,
    RestApiResult,
    UserTokenRefreshFunction,
    ListRequest, ReactionCommand, HasCustomId,
} from "../models/CommonModels";
import {
    Conversation,
    Vote,
    Comment,
    CommentRequest,
    ConversationDeletionResponse,
    ConversationResponse,
    CommentListResponse,
    CommentDeletionResponse,
    ConversationRequest,
    ConversationListResponse,
    SimpleComment,
    RepliesBatchResponse,
    CommentResult,
    User,
    ConversationDetailsListResponse,
    ConversationBatchListOptions, HasConversationID, MayHaveConversationID
} from "../models/CommentsModels";
import {RestfulCommentService} from "./REST/comments/RestfulCommentService";
import {RestfulConversationService} from "./REST/comments/RestfulConversationService";
import {DEFAULT_CONFIG} from "./constants/api";
import {RestfulUserService} from "./REST/users/RestfulUserService";
import {forceObjKeyOrString, CallBackDelegate} from "./utils";
import {ICommentService} from "../API/comments/ICommentService";
import {IConversationService} from "../API/comments/IConversationService";
import {ICommentingClient} from "../API/comments/ICommentingClient";
import {IUserService} from "../API/users/IUserService";
import {UserDeletionResponse, UserListResponse, UserResult, UserSearchType} from "../models/user/User";
import {ReportType} from "../models/Moderation";
import {getUrlConversationId} from "./REST/comments/ConversationUtils";

/**
 * This is the API client for the Conversations feature.
 * For most implementations, this is the main class you will be using.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
export class CommentClient implements ICommentingClient {
    /**
     * Holds the config object
     * @private
     */
    private _config: SportsTalkConfig

    /**
     * Used to create a holder for callbacks that will propagate to sub-modules.
     * @private
     */
    private _callbackDelegate: CallBackDelegate;

    /**
     * Holds the ConversationService powering the client
     * @private
     */
    private _conversationService: IConversationService;
    /**
     * Holds the CommentService powering the client
     * @private
     */
    private _commentService: ICommentService;
    /**
     * Holds the UserService powering the CommentClient
     * @private
     */
    private _userService: IUserService
    /**
     * The current user
     * @private
     */
    private _user: User;
    /**
     * Holds the current conversation state.
     * @private
     */
    private _currentConversationId: string;

    /**
     * Default settings for comment requests.
     * @private
     */
    private _defaultCommentRequest: CommentRequest = {
        includechildren: false
    }
    /**
     * Creates a new Conversation Client
     * @param SportsTalkConfig
     * @param initialConversation Either a conversation object with 'conversationid' property or a conversation id as a string.
     * @param commentService optional and here for future extension for custom implementations of the comment service.
     * @param conversationService optional and here for future extension for cusstom implementations of the comments service.
     */
    static init(config: SportsTalkConfig, initialConversation?:HasConversationID | string, commentService?: IConversationService, conversationService?: IConversationService): CommentClient {
        const commentClient = new CommentClient();
        // @ts-ignore
        commentClient.setConfig(config, commentService, conversationService)
        if(initialConversation) {
            const conversationid = getUrlConversationId(initialConversation as HasConversationID)
            if(conversationid) {
                commentClient.setCurrentConversationId(conversationid);
            } else {
                throw new Error("Cannot set initial conversation, because no conversationID was supplied.")
            }

        }
        return commentClient;
    }

    private constructor() {}

    getTokenExp(): number {
       return 0;
    }

    /**
     * Get the current configuration object
     * @return SportsTalkConfig
     */
    public getConfig = (): SportsTalkConfig => {
        return this._config;
    }


    /**
     * Gets the user's access token. If unset returns an empty string.
     */
    public getUserToken = async ():Promise<string> => {
        return this._config.userToken || '';
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
    setUserTokenRefreshFunction = (userTokenRefreshFunction: UserTokenRefreshFunction) => {
        if(this._callbackDelegate) {
            this._callbackDelegate.setCallback(userTokenRefreshFunction);
        } else {
            this._callbackDelegate = new CallBackDelegate(this, userTokenRefreshFunction);
        }
        this._config.userTokenRefreshFunction = this._callbackDelegate.callback;
        this.setConfig(this._config);
    }

    /**
     * Refreshes the user's access token.  You MUST have already set a user access token AND registered a refresh function.
     * If the refresh function fails to refresh the token, there is no token, or there is an error, this will not refresh the token and throws an error.
     */
    refreshUserToken = async (): Promise<string> => {
        if(!this._config.userToken) {
            throw new Error('You must set a user token before you can refresh it.  Also ensure that you set a refresh function');
        }
        if(!this._config.userTokenRefreshFunction) {
            throw new Error('You must set a refresh function in order to refresh a userToken. Also ensure that the user token JWT is properly set.')
        }
        const newToken = await this._config.userTokenRefreshFunction(this._config.userToken);
        this.setUserToken(newToken);
        return newToken;
    }

    /**
     * Set the current user for commands
     * @param user
     */
    public setUser = (user:User, userToken?: string) => {
        this._user = user;
        if(userToken) {
            this._config.userToken = userToken
            this.setConfig(this._config);
        }
    }

    /**
     * Get the current user.
     */
    public getCurrentUser = () => {
        return this._user;
    }

    /**
     * Set configuration.
     * @param config
     * @param commentService optional, for future extension by custom implementation.
     * @param conversationService optional, for future extension by custom implementation.
     */
    public setConfig = (config: SportsTalkConfig, commentService?: ICommentService, conversationService?: IConversationService) => {
        this._config = Object.assign({}, DEFAULT_CONFIG, config);
        if(!this._commentService || commentService) {
            this._commentService = commentService || new RestfulCommentService()
        }
        if(!this._conversationService || conversationService) {
            this._conversationService = conversationService || new RestfulConversationService();
        }
        if(!this._userService) {
            this._userService = new RestfulUserService(this._config);
        }
        this._conversationService.setConfig(this._config);
        this._commentService.setConfig(this._config);
        if(config.user) {
            this._user = config.user;
        }
    }

    /**
     * Create a new comments.
     * @param conversation the comments to create
     * @param setDefault if set to true (default) will set this comments as the current comments used by other API calls.
     */
    public createConversation = async (conversation: Conversation, setDefault: boolean = true): Promise<ConversationResponse> => {
        const created:ConversationResponse = await this._conversationService.createConversation(conversation);

        if(setDefault) {
            this._currentConversationId = getUrlConversationId((created));
        }
        return created;
    }

    /**
     * Returns a conversation if it already exists, otherwise creates it and sets it as default.
     * Does NOT update a conversation's settings if it already exists.  Settings should be primarily managed from the dashboard.
     * @param conversation
     */
    public ensureConversation = async(conversation: Conversation): Promise<Conversation> => {
        const conversation_id  = getUrlConversationId(conversation as HasConversationID)
        return this.getConversation(conversation_id)
            .then(conversation => {
                const conversation_id  = getUrlConversationId(conversation as HasConversationID)
                this.setCurrentConversationId(conversation_id);
                return conversation
            })
            .catch(error=>{
                console.log(error);
                return this.createConversation(conversation, true);
            })
    }

    /**
     * Get the default comments
     * @param conversation
     */
    public setCurrentConversationId = (conversation: HasConversationID | string): Conversation | string => {
        this._currentConversationId = getUrlConversationId(conversation)
        return this._currentConversationId
    }
    /**
     * Returns the current default comments
     * @return conversation a Conversation object, a string for the conversationID, or null.
     */
    public getCurrentConversationId = (): Conversation | string | null => {
       return this._currentConversationId;
    }



    /**
     * Retrieves a comments from the server
     * @param conversation
     */
    public getConversation = (conversation: HasConversationID | string): Promise<Conversation> => {
        if(!conversation) {
            throw new Error("Missing conversation id, cannot get conversation");
        }
       return <Promise<Conversation>> this._conversationService.getConversation(conversation)
    }

    public getConversationByCustomId(conversation: HasCustomId | string): Promise<ConversationResponse> {
        return this._conversationService.getConversationByCustomId(conversation);
    }

    public reactToConversationTopic = (conversation: HasConversationID | string, reaction: ReactionCommand = {reaction:'like', reacted: true}, user?: User) => {
        return this._conversationService.reactToConversationTopic(conversation, reaction || {}, user || this._user)
    }

    /**
     * Deletes a comments. Be careful. Cannot be reversed
     * @param conversation
     */
    public deleteConversation = (conversation: HasConversationID | string): Promise<ConversationDeletionResponse> => {
        return <Promise<ConversationDeletionResponse>> this._conversationService.deleteConversation(conversation);
    }

    /**
     *
     * @param comment The comment string or Comment object
     * @param replyto either the comment object to reply to or the ID as a string
     */
    public publishComment = (comment: string | Comment, replyto?: Comment | string): Promise<CommentResult> => {
        const conversationid = forceObjKeyOrString(this._currentConversationId, 'conversationid')
        return this._commentService.publishComment(conversationid, comment, this._user, replyto);
    }

    /**
     * Retrieves a specific comment
     * @param comment
     */
    public getComment = (comment: CommentResult | string):Promise<CommentResult | null> =>  {
        const conversationid:string = forceObjKeyOrString(this._currentConversationId, 'conversationid')
        return this._commentService.getComment(conversationid, comment);
    }

    /**
     * If the user exists, updates the user. Otherwise creates a new user.
     * @param user a User model.  The values of 'banned', 'handlelowercase' and 'kind' are ignored.
     */
    createOrUpdateUser = (user: User, setDefault:boolean = true): Promise<UserResult> => {
        return this._userService.createOrUpdateUser(user).then(user=>{
            if(setDefault) {
                this._user = user;
            }
            return user;
        })
    }


    /**
     * Deletes a comment
     * @param comment
     * @param final
     */
    public deleteComment = (comment:CommentResult | string, final: boolean): Promise<CommentDeletionResponse> => {
        const conversationid = forceObjKeyOrString(this._currentConversationId, 'conversationid')
        return this._commentService.deleteComment(conversationid, comment, this._user, final);
    }

    /**
     * Update a comment that already exists
     * @param comment
     */
    public updateComment = (comment: CommentResult): Promise<Comment> => {
        // @ts-ignore
        const conversationid = forceObjKeyOrString(this._currentConversationId, 'conversationid')
        return this._commentService.updateComment(conversationid, comment, this._user);
    }

    /**
     * Issues a comment reaction.
     * @param comment
     * @param reaction
     */
    public reactToComment = (comment:CommentResult, reaction: ReactionCommand = {reaction:'like', reacted: true}): Promise<Comment> => {
        const conversationid = forceObjKeyOrString(this._currentConversationId, 'conversationid')
        return this._commentService.react(conversationid, comment, this._user, reaction);
    }

    /**
     * Votes on a comment
     * @param comment
     * @param vote
     */
    public voteOnComment = (comment:CommentResult | string, vote:Vote): Promise<CommentResult> => {
        const conversationid = forceObjKeyOrString(this._currentConversationId, 'conversationid')
        return this._commentService.vote(conversationid, comment, this._user, vote);
    }

    /**
     * Report a comment for violating the rules
     * @param comment
     * @param reportType
     */
    public reportComment = (comment:CommentResult, reportType: ReportType): Promise<Comment> => {
        const conversationid = forceObjKeyOrString(this._currentConversationId, 'conversationid')
        return this._commentService.report(conversationid, comment, this._user, reportType);
    }

    /**
     * Get replies to a specific comment
     * @param comment
     * @param request
     */
    public getCommentReplies = (comment:CommentResult | string, request?: CommentRequest): Promise<CommentListResponse> => {
        const conversationid = forceObjKeyOrString(this._currentConversationId, 'conversationid')
        const commentid =  forceObjKeyOrString(comment)
        return this._commentService.getReplies(conversationid, commentid, request);
    }

    public listRepliesBatch = (parentids: string[], limit:number=50): Promise<RepliesBatchResponse> => {
        const conversationid = forceObjKeyOrString(this._currentConversationId, 'conversationid')
        return this._commentService.listRepliesBatch(conversationid, parentids, limit)
    }
    /**
     * Retrieves comments
     * @param request how to sort/filter the comments.  See CommentRequest
     * @param conversation optional, if removed will retrieve the comments for the comments set with `setConversation()`
     */
    public listComments = (request?: CommentRequest, conversation?: Conversation): Promise<CommentListResponse> => {
        const conversationid = forceObjKeyOrString(conversation || this._currentConversationId, 'conversationid')
        const finalRequest = Object.assign({}, this._defaultCommentRequest, request);
        // @ts-ignore
        return this._commentService.listComments(conversationid, finalRequest);
    }

    /**
     * List available conversations
     * @param filter a conversationrequest, currently allows you to filter only by property.
     */
    public listConversations = (filter?: ConversationRequest): Promise<ConversationListResponse> => {
        return this._conversationService.listConversations( filter);
    }

    setBanStatus = (user: User | string, isBanned: boolean): Promise<UserResult> => {
        return this._userService.setBanStatus(user, isBanned);
    }

    searchUsers = (search: string, type: UserSearchType, limit?:number): Promise<UserListResponse> => {
        return this._userService.searchUsers(search, type, limit);
    }

    listUsers = (request?: ListRequest): Promise<UserListResponse> => {
        return this._userService.listUsers(request);
    }
    deleteUser = (user:User | string):Promise<UserDeletionResponse> => {
        return this._userService.deleteUser(user);
    }

    getUserDetails = (user: User | string): Promise<UserResult> => {
        return this._userService.getUserDetails(user);
    }

    getConversationBatchDetails = (conversations: HasConversationID[] | string[], options?:ConversationBatchListOptions ): Promise<ConversationDetailsListResponse> => {
        //@ts-ignore
        return this._conversationService.getConversationBatchDetails(conversations, options);
    }


}
