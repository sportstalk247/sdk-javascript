import {Reaction, SportsTalkConfig, User, ReportType} from "../models/CommonModels";
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
    SimpleComment
} from "../models/CommentsModels";
import {RestfulCommentService} from "./comments/REST/RestfulCommentService";
import {RestfulConversationService} from "./comments/REST/RestfulConversationService";
import {IConversationService, ICommentService, ICommentingClient} from "../API/CommentsAPI";
import {DEFAULT_CONFIG} from "./constants/api";
import {RestfulUserService} from "./common/REST/RestfulUserService";
import {IUserService} from "../API/CommonAPI";

/**
 * This is the API client for the Conversations feature.
 * For most implementations, this is the main class you will be using.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 */
export class CommentClient implements ICommentingClient {
    private _config: SportsTalkConfig
    private _conversationService: IConversationService;
    private _commentService: ICommentService;
    private _userService: IUserService
    private _user: User;

    /**
     * Creates a new Conversation Client
     * @param config
     * @param initialConversation Either a comments object or a comments id
     * @param commentService optional and here for future extension for custom implementations of the comment service.
     * @param conversationService optional and here for future extension for cusstom implementations of the comments service.
     */
    static create(config: SportsTalkConfig, initialConversation?:Conversation | string, commentService?: IConversationService, conversationService?: IConversationService): CommentClient {
        const commentClient = new CommentClient();
        // @ts-ignore
        commentClient.setConfig(config, commentService, conversationService)
        if(initialConversation) {
            commentClient.setCurrentConversation(initialConversation)
        }
        return commentClient;
    }

    /**
     * Get the current configuration object
     */
    public getConfig = (): SportsTalkConfig => {
        return this._config;
    }

    /**
     * Set the current user for commands
     * @param user
     */
    public setUser = (user:User) => {
        this._user = user;
    }

    /**
     * Get the current user.
     */
    public getUser = () => {
        return this._user;
    }

    /**
     * Set configuration.
     * @param config
     * @param commentManager optional, for future extension by custom implementation.
     * @param conversationManager optional, for future extension by custom implementation.
     */
    public setConfig = (config: SportsTalkConfig, commentManager?: ICommentService, conversationManager?: IConversationService) => {
        this._config = Object.assign({}, DEFAULT_CONFIG, config);
        if(!this._commentService || commentManager) {
            this._commentService = commentManager || new RestfulCommentService()
        }
        if(!this._conversationService || conversationManager) {
            this._conversationService = conversationManager || new RestfulConversationService();
        }
        if(!this._userService) {
            this._userService = new RestfulUserService(this._config);
        }
        this._conversationService.setConfig(this._config);
        this._commentService.setConfig(this._config);
        if(config.user) {
            this._user = config.user;
        }
        return this;
    }

    /**
     * Create a new comments.
     * @param conversation the comments to create
     * @param setDefault if set to true (default) will set this comments as the current comments used by other API calls.
     */
    public createConversation = async (conversation: Conversation, setDefault: boolean = true): Promise<ConversationResponse> => {
        const created:ConversationResponse = await this._conversationService.createConversation(conversation);
        if(setDefault) {
            this._commentService.setConversation(created);
        }
        return created;
    }

    /**
     * Get the default comments
     * @param conversation
     */
    public setCurrentConversation = (conversation: Conversation | string): Conversation => {
        this._commentService.setConversation(conversation);
        return <Conversation>this._commentService.getConversation();
    }
    /**
     * Returns the current default comments
     */
    public getCurrentConversation = (): Conversation | null => {
        return this._commentService.getConversation();
    }

    /**
     * Retrieves a comments from the server
     * @param conversation
     */
    public getConversation = (conversation: Conversation | string): Promise<Conversation> => {
       return <Promise<Conversation>> this._conversationService.getConversation(conversation)
    }

    /**
     * Deletes a comments. Be careful. Cannot be reversed
     * @param conversation
     */
    public deleteConversation = (conversation: Conversation | string): Promise<ConversationDeletionResponse> => {
        return <Promise<ConversationDeletionResponse>> this._conversationService.deleteConversation(conversation);
    }

    /**
     *
     * @param comment The comment string.
     * @param replyto either the comment object to reply to or the ID as a string
     */
    public publishComment = (comment: string | SimpleComment, replyto?: Comment | string): Promise<Comment> => {
        return this._commentService.createComment(comment, this._user, replyto);
    }

    /**
     * Retrieves a specific comment
     * @param comment
     */
    public getComment = (comment: Comment | string) => {
        return this._commentService.getComment(comment);
    }

    /**
     * If the user exists, updates the user. Otherwise creates a new user.
     * @param user a User model.  The values of 'banned', 'handlelowercase' and 'kind' are ignored.
     */
    createOrUpdateUser = (user: User, setDefault:boolean = true): Promise<User> => {
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
    public deleteComment = (comment:Comment | string, final: boolean): Promise<CommentDeletionResponse> => {
        return this._commentService.deleteComment(comment, this._user, final);
    }

    /**
     * Update a comment that already exists
     * @param comment
     */
    public updateComment = (comment:Comment): Promise<Comment> => {
        // @ts-ignore
        return this._commentService.updateComment(comment, this._user);
    }

    /**
     * Issues a comment reaction.
     * @param comment
     * @param reaction
     */
    public reactToComment = (comment:Comment, reaction:Reaction): Promise<Comment> => {
        return this._commentService.react(comment, this._user, reaction);
    }

    /**
     * Votes on a comment
     * @param comment
     * @param vote
     */
    public voteOnComment = (comment:Comment, vote:Vote): Promise<Comment> => {
        return this._commentService.vote(comment, this._user, vote);
    }

    /**
     * Report a comment for violating the rules
     * @param comment
     * @param reportType
     */
    public reportComment = (comment:Comment, reportType: ReportType): Promise<Comment> => {
        return this._commentService.report(comment, this._user, reportType);
    }

    /**
     * Get replies to a specific comment
     * @param comment
     * @param request
     */
    public getCommentReplies = (comment:Comment, request?: CommentRequest): Promise<CommentListResponse> => {
        return this._commentService.getReplies(comment, request);
    }

    /**
     * Retrieves comments
     * @param request how to sort/filter the comments.  See CommentRequest
     * @param conversation optional, if removed will retrieve the comments for the comments set with `setConversation()`
     */
    public getComments = (request?: CommentRequest, conversation?: Conversation): Promise<CommentListResponse> => {
        // @ts-ignore
        return this._commentService.getComments(request, conversation);
    }

    /**
     * List available conversations
     * @param filter a conversationrequest, currently allows you to filter only by property.
     */
    public listConversations = (filter?: ConversationRequest): Promise<ConversationListResponse> => {
        return this._conversationService.listConversations( filter);
    }

}