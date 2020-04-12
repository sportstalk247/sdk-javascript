import {IConfigurable, ISportsTalkConfigurable, IUserConfigurable} from "./CommonAPI";
import {
    Comment,
    CommentDeletionResponse,
    Conversation,
    ConversationResponse,
    ConversationDeletionResponse, Vote, CommentRequest, Commentary, User, CommentResponse
} from "../models/ConversationModels";

import {Reaction, SportsTalkConfig, ReportType, ApiResult} from "../models/CommonModels";

export interface ICommentManager extends ISportsTalkConfigurable {
    setConversation(conversation: Conversation | string): Conversation;
    create(comment: Comment | string, user: User, replyto?: Comment | string): Promise<Comment>;
    getComment(comment: Comment | string): Promise<Comment>;
    delete(comment: Comment | string, user: User, final?: boolean): Promise<CommentDeletionResponse>
    update(comment: Comment, user: User): Promise<Comment>;
    vote(comment: Comment, user: User, vote:Vote): Promise<Comment>
    report(comment: Comment, user:User, reporttype: ReportType): Promise<Comment>
    react(comment:Comment | string, user: User, reaction:Reaction, enable?: boolean): Promise<Comment>;
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
    getModerationQueue(): Promise<Array<Comment>>
    rejectComment(comment: Comment): Promise<ApiResult<null>>
    approveComment(comment: Comment): Promise<ApiResult<null>>
}

export interface IConversationClient extends ISportsTalkConfigurable, IUserConfigurable   {
    getConfig(): SportsTalkConfig;
    setConfig(config: SportsTalkConfig, commentManager?: ICommentManager, conversationManager?: IConversationManager): IConversationClient;
    createConversation (conversation: Conversation, setDefault: boolean): Promise<Conversation>;
    setConversation(conversation: Conversation | string): Conversation;
    getConversation(conversation: Conversation | string): Promise<Conversation>;
    getConversationsByProperty(property: string): Promise<Array<Conversation>>;
    deleteConversation(conversation: Conversation | string);
    makeComment(comment: string, replyto?: Comment | string): Promise<Comment>;
    getComment(comment: Comment | string): Promise<Comment>;
    deleteComment(comment:Comment | string, final: boolean): Promise<CommentDeletionResponse>;
    updateComment(comment:Comment): Promise<Comment>;
    reactToComment(comment:Comment | string, reaction:Reaction): Promise<Comment>;
    voteOnComment(comment:Comment | string, vote:Vote);
    reportComment(comment:Comment | string, reportType: ReportType): Promise<Comment>;
    getCommentReplies(comment:Comment, request: CommentRequest): Array<Comment>;
    getComments(request?: CommentRequest, conversation?: Conversation): Array<Comment>;
}