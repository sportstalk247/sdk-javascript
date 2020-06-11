/* istanbul ignore file */

import {IConfigurable, ISportsTalkConfigurable, IUserConfigurable} from "./CommonAPI";
import {
    Comment,
    CommentDeletionResponse,
    Conversation,
    ConversationResponse,
    ConversationDeletionResponse,
    Vote,
    CommentRequest,
    CommentListResponse,
    User,
    CommentResponse,
    ConversationRequest,
    ConversationListResponse, SimpleComment, RepliesBatchResponse
} from "../models/CommentsModels";

import {
    Reaction,
    SportsTalkConfig,
    ReportType,
    RestApiResult,
    UserResult,
    UserSearchType, UserListResponse, ListRequest, UserDeletionResponse
} from "../models/CommonModels";

export interface ICommentService extends ISportsTalkConfigurable {
    publishComment(convesationId: string, comment: Comment | SimpleComment | string, user: User, replyto?: Comment | string): Promise<CommentResponse>;
    getComment(convesationId: string, comment: Comment | string): Promise<CommentResponse | null>;
    deleteComment(convesationId: string, comment: CommentResponse | string, user: User, final?: boolean): Promise<CommentDeletionResponse>
    updateComment(convesationId: string, comment: CommentResponse, user: User): Promise<CommentResponse>;
    vote(convesationId: string, comment: Comment | string, user: User, vote:Vote): Promise<CommentResponse>
    report(convesationId: string, comment: Comment, user:User, reporttype: ReportType): Promise<CommentResponse>
    react(convesationId: string, comment:Comment | string, user: User, reaction:Reaction, enable?: boolean): Promise<CommentResponse>;
    getReplies(convesationId: string, comment: Comment | string, request?: CommentRequest): Promise<CommentListResponse>
    listComments(convesationId: string, request?: CommentRequest): Promise<CommentListResponse>
    listRepliesBatch(conversation: Conversation | string, parentids: string[], childlimit?:number): Promise<RepliesBatchResponse>
}

export interface IConversationService extends IConfigurable {
    createConversation(settings: Conversation): Promise<ConversationResponse>;
    getConversation(conversation: Conversation | string): Promise<ConversationResponse>;
    getConversationByCustomId(conversation: Conversation | string): Promise<ConversationResponse>
    listConversations(filter?: ConversationRequest):Promise<ConversationListResponse>
    deleteConversation(conversation: Conversation | string): Promise<ConversationDeletionResponse>
}

export interface ICommentModerationService extends IConfigurable {
    listCommentsInModerationQueue():  Promise<CommentListResponse>
    rejectComment(comment: Comment): Promise<Comment>
    approveComment(comment: Comment): Promise<Comment>
}

export interface ICommentingClient extends ISportsTalkConfigurable, IUserConfigurable   {
    getConfig(): SportsTalkConfig;
    setConfig(config: SportsTalkConfig, commentManager?: ICommentService, conversationManager?: IConversationService)
    createConversation (conversation: Conversation, setDefault: boolean): Promise<Conversation>;
    createOrUpdateUser (user: User, setDefault?:boolean): Promise<User>;
    setCurrentConversation(conversation: Conversation | string): Conversation | string;
    getCurrentConversation(): Conversation | string | null | undefined;
    getConversation(conversation: Conversation | string): Promise<Conversation>;
    getConversationByCustomId(conversation: Conversation | string): Promise<ConversationResponse>
    deleteConversation(conversation: Conversation | string);
    publishComment(comment: string | SimpleComment | Comment, replyto?: Comment | string): Promise<Comment>;
    getComment(comment: Comment | string): Promise<Comment | null>;
    deleteComment(comment:Comment | string, final: boolean): Promise<CommentDeletionResponse>;
    updateComment(comment:Comment): Promise<Comment>;
    reactToComment(comment:Comment | string, reaction:Reaction): Promise<Comment>;
    voteOnComment(comment:Comment | string, vote:Vote);
    reportComment(comment:Comment | string, reportType: ReportType): Promise<Comment>;
    getCommentReplies(comment:CommentResponse, request?: CommentRequest): Promise<CommentListResponse>
    listComments(request?: CommentRequest, conversation?: Conversation): Promise<CommentListResponse>
    listConversations(filter?: ConversationRequest): Promise<ConversationListResponse>
    setBanStatus(user: User | string, isBanned: boolean): Promise<RestApiResult<UserResult>>
    createOrUpdateUser(user: User): Promise<UserResult>
    searchUsers(search: string, type: UserSearchType, limit?:number): Promise<UserListResponse>
    listUsers(request?: ListRequest): Promise<UserListResponse>
    deleteUser(user:User | string):Promise<UserDeletionResponse>
    getUserDetails(user: User | string): Promise<UserResult>
    listRepliesBatch(parentids: string[], limit:number): Promise<RepliesBatchResponse>
}