import {ISportsTalkConfigurable, IUserConfigurable} from "../Configuration";
import {
    HasCustomId,
    ListRequest,
    Reaction, ReactionCommand,
    SportsTalkConfig
} from "../../models/CommonModels";
import {ICommentService} from "./ICommentService";
import {IConversationService} from "./IConversationService";
import {
    Comment,
    CommentDeletionResponse,
    CommentListResponse,
    CommentRequest,
    CommentResult,
    Conversation, ConversationBatchListOptions,
    ConversationDeletionResponse, ConversationDetailsListResponse,
    ConversationListResponse,
    ConversationRequest,
    ConversationResponse, HasConversationID,
    RepliesBatchResponse,
    SimpleComment, User,
    Vote
} from "../../models/CommentsModels";
import {UserDeletionResponse, UserListResponse, UserResult, UserSearchType} from "../../models/user/User";
import {ReportType} from "../../models/Moderation";

/**
 * @interface
 */
export interface ICommentingClient extends ISportsTalkConfigurable, IUserConfigurable {
    getConfig(): SportsTalkConfig;

    setConfig(config: SportsTalkConfig, commentManager?: ICommentService, conversationManager?: IConversationService): void

    createConversation(conversation: Conversation, setDefault: boolean): Promise<Conversation>;

    createOrUpdateUser(user: User, setDefault?: boolean): Promise<User>;

    setCurrentConversationId(conversation: HasConversationID | string): Conversation | string;

    getCurrentConversation(): Conversation | string | null | undefined;

    getConversation(conversation: HasConversationID | string): Promise<Conversation>;

    getConversationByCustomId(conversation_custom_id: HasCustomId | string): Promise<ConversationResponse>

    deleteConversation(conversation: HasConversationID | string): Promise<ConversationDeletionResponse>;

    publishComment(comment: string | SimpleComment | Comment, replyto?: Comment | string): Promise<Comment>;

    getComment(comment: Comment | string): Promise<Comment | null>;

    deleteComment(comment: Comment | string, final: boolean): Promise<CommentDeletionResponse>;

    updateComment(comment: Comment): Promise<Comment>;

    reactToComment(comment:CommentResult, reaction: ReactionCommand): Promise<Comment>;

    voteOnComment(comment: Comment | string, vote: Vote): Promise<CommentResult>;

    reportComment(comment: Comment | string, reportType: ReportType): Promise<Comment>;

    getCommentReplies(comment: CommentResult, request?: CommentRequest): Promise<CommentListResponse>

    listComments(request?: CommentRequest, conversation?: Conversation): Promise<CommentListResponse>

    listConversations(filter?: ConversationRequest): Promise<ConversationListResponse>

    setBanStatus(user: User | string, isBanned: boolean): Promise<UserResult>

    createOrUpdateUser(user: User): Promise<UserResult>

    searchUsers(search: string, type: UserSearchType, limit?: number): Promise<UserListResponse>

    listUsers(request?: ListRequest): Promise<UserListResponse>

    deleteUser(user: User | string): Promise<UserDeletionResponse>

    getUserDetails(user: User | string): Promise<UserResult>

    listRepliesBatch(parentids: string[], limit: number): Promise<RepliesBatchResponse>

    getConversationBatchDetails(conversation: HasConversationID[] | string[], options?:ConversationBatchListOptions ): Promise<ConversationDetailsListResponse>

    reactToConversationTopic(conversation: HasConversationID | string, reaction?: ReactionCommand, user?: User): Promise<ConversationResponse>
}