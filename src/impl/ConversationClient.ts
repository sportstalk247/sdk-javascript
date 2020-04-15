import {Reaction, SportsTalkConfig, User, ReportType} from "../models/CommonModels";
import {
    Conversation,
    Vote,
    Comment,
    CommentRequest,
    ConversationDeletionResponse,
    ConversationResponse, CommentListResponse, CommentDeletionResponse, ConversationRequest, ConversationListResponse
} from "../models/ConversationModels";
import {RestfulCommentService} from "./conversation/REST/RestfulCommentService";
import {RestfulConversationService} from "./conversation/REST/RestfulConversationService";
import {IConversationService, ICommentService, IConversationClient} from "../API/ConversationAPI";


export class ConversationClient implements IConversationClient {
    private _config: SportsTalkConfig;
    private _conversationService: IConversationService;
    private _commentService: ICommentService;
    private _user: User;

    static create(config: SportsTalkConfig, initialConversation?:Conversation | string, commentManager?: IConversationService, conversationManager?: IConversationService): ConversationClient {
        const commentClient = new ConversationClient();
        // @ts-ignore
        commentClient.setConfig(config, commentManager, conversationManager)
        if(initialConversation) {
            commentClient.setDefaultConversation(initialConversation)
        }
        return commentClient;
    }

    public getConfig = (): SportsTalkConfig => {
        return this._config;
    }

    public setUser = (user:User) => {
        this._user = user;
    }
    public getUser = () => {
        return this._user;
    }

    public setConfig = (config: SportsTalkConfig, commentManager?: ICommentService, conversationManager?: IConversationService) => {
        if(!this._commentService || commentManager) {
            this._commentService = commentManager || new RestfulCommentService()
        }
        if(!this._conversationService || conversationManager) {
            this._conversationService = conversationManager || new RestfulConversationService();
        }
        this._config = config;
        this._conversationService.setConfig(this._config);
        this._commentService.setConfig(this._config);
        if(config.user) {
            this._user = config.user;
        }
        return this;
    }


    public createConversation = async (conversation: Conversation, setDefault: boolean = true) => {
        const created:ConversationResponse = await this._conversationService.createConversation(conversation);
        if(setDefault) {
            this._commentService.setConversation(created);
        }
        return created;
    }

    public setDefaultConversation = (conversation: Conversation | string): Conversation => {
        this._commentService.setConversation(conversation);
        return <Conversation>this._commentService.getConversation();
    }
    public getDefaultConversation = () => {
        return this._commentService.getConversation();
    }

    public getConversation = (conversation: Conversation | string): Promise<Conversation> => {
       return <Promise<Conversation>> this._conversationService.getConversation(conversation)
    }

    // Deletes a conversation.  Be careful.
    public deleteConversation = (conversation: Conversation | string): Promise<ConversationDeletionResponse> => {
        return <Promise<ConversationDeletionResponse>> this._conversationService.deleteConversation(conversation);
    }

    /**
     *
     * @param comment The comment string.
     * @param replyto either the comment object to reply to or the ID as a string
     */
    public makeComment = (comment: string, replyto?: Comment | string) => {
        return this._commentService.create(comment, this._user, replyto);
    }

    public getComment = (comment: Comment | string) => {
        return this._commentService.getComment(comment);
    }

    public deleteComment = (comment:Comment | string, final: boolean): Promise<CommentDeletionResponse> => {
        return this._commentService.delete(comment, this._user, final);
    }

    public updateComment = (comment:Comment): Promise<Comment> => {
        // @ts-ignore
        return this._commentService.update(comment, this._user);
    }

    public reactToComment = (comment:Comment, reaction:Reaction): Promise<Comment> => {
        return this._commentService.react(comment, this._user, reaction);
    }

    public voteOnComment = (comment:Comment, vote:Vote): Promise<Comment> => {
        return this._commentService.vote(comment, this._user, vote);
    }

    public reportComment = (comment:Comment, reportType: ReportType): Promise<Comment> => {
        return this._commentService.report(comment, this._user, reportType);
    }

    public getCommentReplies = (comment:Comment, request?: CommentRequest): Promise<CommentListResponse> => {
        return this._commentService.getReplies(comment, request);
    }

    /**
     * Retrieves comments
     * @param request how to sort/filter the comments.  See CommentRequest
     * @param conversation optional, if removed will retrieve the comments for the conversation set with `setConversation()`
     */
    public getComments = (request?: CommentRequest, conversation?: Conversation): Promise<CommentListResponse> => {
        // @ts-ignore
        return this._commentService.getComments(request, conversation);
    }

    public listConversations = (filter?: ConversationRequest): Promise<ConversationListResponse> => {
        return this._conversationService.listConversations( filter);
    }

}