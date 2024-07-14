import {ISportsTalkConfigurable} from "../Configuration";
import {
    Comment,
    CommentDeletionResponse,
    CommentListResponse,
    CommentRequest,
    CommentResult,
    Conversation, HasConversationID,
    RepliesBatchResponse,
    SimpleComment,
    User,
    Vote
} from "../../models/CommentsModels";
import {Reaction, ReactionCommand} from "../../models/CommonModels";
import {ReportType} from "../../models/Moderation";

/**
 * @interface
 */
export interface ICommentService extends ISportsTalkConfigurable {
    publishComment(conversationId: string, comment: Comment | SimpleComment | string, user: User, replyto?: Comment | string): Promise<CommentResult>;

    getComment(conversationId: string, comment: Comment | string): Promise<CommentResult | null>;

    deleteComment(conversationId: string, comment: CommentResult | string, user: User, final?: boolean): Promise<CommentDeletionResponse>

    updateComment(conversationId: string, comment: CommentResult, user: User): Promise<CommentResult>;

    vote(conversationId: string, comment: Comment | string, user: User, vote: Vote): Promise<CommentResult>

    report(conversationId: string, comment: Comment, user: User, reporttype: ReportType): Promise<CommentResult>

    react(conversationId: string, comment: Comment | string, user: User, reaction: ReactionCommand): Promise<CommentResult>;

    getReplies(conversationId: string, comment: Comment | string, request?: CommentRequest): Promise<CommentListResponse>

    listComments(conversationId: HasConversationID | string, request?: CommentRequest): Promise<CommentListResponse>

    listRepliesBatch(conversation: HasConversationID | string, parentids: string[], childlimit?: number): Promise<RepliesBatchResponse>
}