import {IConfigurable, ISportsTalkConfigurable, IUserConfigurable} from "./CommonAPI";
import {
    Comment,
    CommentDeletionResponse,
    Conversation,
    ConversationResponse,
    ConversationDeletionResponse, ReactionResponse, Vote, CommentRequest, Commentary, User
} from "../models/ConversationModels";

import {Reaction, SportsTalkConfig, ReportType} from "../models/CommonModels";

export interface ICommentManager extends ISportsTalkConfigurable {
    setConversation(conversation: Conversation | string): Conversation;
    create(comment: Comment | string, user: User, replyto?: Comment | string): Promise<Comment>;
    get(comment: Comment | string): Promise<Comment>;
    delete(comment: Comment | string, user: User, final?: boolean): Promise<CommentDeletionResponse>
    update(comment: Comment, user: User): Promise<Comment>;
    vote(comment: Comment, user: User, vote:Vote);
    report(comment: Comment, user:User, reporttype: ReportType)
    react(comment:Comment | string, user: User, reaction:Reaction, enable?: boolean): Promise<ReactionResponse>;
    getReplies(comment: Comment, request?: CommentRequest): Promise<Array<Comment>>
    getComments(request?: CommentRequest, conversation?: Conversation): Promise<Commentary>
    getConversation(): Conversation | null
}

export interface IConversationManager extends IConfigurable {
    createConversation(settings: Conversation): Promise<ConversationResponse>;
    getConversation(conversation: Conversation | string): Promise<ConversationResponse>;
    getConversationsByProperty(property:string): Promise<Array<Conversation>>;
    deleteConversation(conversation: Conversation | string): Promise<ConversationDeletionResponse>
}

export interface IConversationModerationManager extends IConfigurable {

}

export interface IConversationClient extends ISportsTalkConfigurable, IUserConfigurable   {
    getConfig(): SportsTalkConfig;
    setConfig(config: SportsTalkConfig, commentManager?: ICommentManager, conversationManager?: IConversationManager): IConversationClient;
    createConversation (conversation: Conversation, setDefault: boolean): Promise<Conversation>;
    setConversation(conversation: Conversation | string): Conversation;
    getConversation(conversation: Conversation | string): Promise<Conversation>;
    getConversationsByProperty(property: string): Promise<Array<Conversation>>;
    deleteConversation(conversation: Conversation | string);
    makeComment(comment: string, replyto?: Comment | string);
    getComment(comment: Comment | string);
    deleteComment(comment:Comment | string);
    updateComment(comment:Comment): Promise<Comment>;
    reactToComment(comment:Comment | string, reaction:Reaction);
    voteOnComment(comment:Comment | string, vote:Vote);
    reportComment(comment:Comment | string, reportType: ReportType);
    getCommentReplies(comment:Comment, request: CommentRequest);
    getComments(request?: CommentRequest, conversation?: Conversation);
}