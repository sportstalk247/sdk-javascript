import {Reaction, SportsTalkConfig, User, ReportType} from "../models/CommonModels";
import {
    Conversation,
    Vote,
    Comment,
    CommentRequest,
    ConversationDeletionResponse,
    ShortComment, ConversationResponse, Commentary
} from "../models/ConversationModels";
import {RestfulCommentManager} from "./conversation/REST/RestfulCommentManager";
import {RestfulConversationManager} from "./conversation/REST/RestfulConversationManager";
import {IConversationManager, ICommentManager, IConversationClient} from "../API/ConversationAPI";


export class ConversationClient implements IConversationClient {
    private _config: SportsTalkConfig;
    private _conversationManager: IConversationManager;
    private _commentManager: ICommentManager;
    private _user: User;

    static create(config: SportsTalkConfig, initialConversation?:Conversation | string, commentManager?: IConversationManager, conversationManager?: IConversationManager): ConversationClient {
        const commentClient = new ConversationClient();
        // @ts-ignore
        commentClient.setConfig(config, commentManager, conversationManager)
        if(initialConversation) {
            commentClient.setConversation(initialConversation)
        }
        return commentClient;
    }

    public getConfig = (): SportsTalkConfig => {
        return this._config;
    }

    public setUser = (user:User) => {
        this._user = user;
    }

    public setConfig = (config: SportsTalkConfig, commentManager?: ICommentManager, conversationManager?: IConversationManager) => {
        if(!this._commentManager || commentManager) {
            this._commentManager = commentManager || new RestfulCommentManager()
        }
        if(!this._conversationManager || conversationManager) {
            this._conversationManager = conversationManager || new RestfulConversationManager();
        }
        this._config = config;
        this._conversationManager.setConfig(this._config);
        this._commentManager.setConfig(this._config);
        if(config.user) {
            this._user = config.user;
        }
        return this;
    }


    public createConversation = async (conversation: Conversation, setDefault: boolean = true) => {
        const created:ConversationResponse = await this._conversationManager.createConversation(conversation);
        if(setDefault) {
            this._commentManager.setConversation(created);
        }
        return created;
    }

    public setConversation = (conversation: Conversation | string): Conversation => {
        this._commentManager.setConversation(conversation);
        return <Conversation>this._commentManager.getConversation();
    }

    public getConversation = (conversation: Conversation | string): Promise<Conversation> => {
       return <Promise<Conversation>> this._conversationManager.getConversation(conversation)
    }

    public getConversationsByProperty = (property: string): Promise<Array<Conversation>> => {
       // @ts-ignore
        return this._conversationManager.getConversationsByProperty(property);
    }

    // Deletes a conversation.  Be careful.
    public deleteConversation = (conversation: Conversation | string): Promise<ConversationDeletionResponse> => {
        return <Promise<ConversationDeletionResponse>> this._conversationManager.deleteConversation(conversation);
    }

    /**
     *
     * @param comment The comment string.
     * @param replyto either the comment object to reply to or the ID as a string
     */
    public makeComment = (comment: string, replyto?: Comment | string) => {
        return this._commentManager.create(comment, this._user, replyto);
    }

    public getComment = (comment: Comment | string) => {
        return this._commentManager.get(comment);
    }

    public deleteComment = (comment:Comment | string) => {
        return this._commentManager.delete(comment, this._user);
    }

    public updateComment = (comment:Comment): Promise<Comment> => {
        // @ts-ignore
        return this._commentManager.update(comment, this._user);
    }

    public reactToComment = (comment:Comment, reaction:Reaction): Promise<Comment> => {
        return this._commentManager.react(comment, this._user, reaction);
    }

    public voteOnComment = (comment:Comment, vote:Vote) => {
        return this._commentManager.vote(comment, this._user, vote);
    }

    public reportComment = (comment:Comment, reportType: ReportType) => {
        return this._commentManager.report(comment, this._user, reportType);
    }

    public getCommentReplies = (comment:Comment, request: CommentRequest) => {
        return this._commentManager.getReplies(comment, request);
    }

    /**
     * Retrieves comments
     * @param request how to sort/filter the comments.  See CommentRequest
     * @param conversation optional, if removed will retrieve the comments for the conversation set with `setConversation()`
     */
    public getComments = (request?: CommentRequest, conversation?: Conversation): Promise<Commentary> => {
        // @ts-ignore
        return this._commentManager.getComments(request, conversation);
    }

}