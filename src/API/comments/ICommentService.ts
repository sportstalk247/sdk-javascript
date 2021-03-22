import {ISportsTalkConfigurable} from "../Configuration";
import {
    Comment,
    CommentDeletionResponse,
    CommentListResponse,
    CommentRequest,
    CommentResult,
    Conversation,
    RepliesBatchResponse,
    SimpleComment,
    User,
    Vote
} from "../../models/CommentsModels";
import {Reaction, ReportType} from "../../models/CommonModels";

/**
 * @interface
 */
export interface ICommentService extends ISportsTalkConfigurable {
    publishComment(convesationId: string, comment: Comment | SimpleComment | string, user: User, replyto?: Comment | string): Promise<CommentResult>;

    getComment(convesationId: string, comment: Comment | string): Promise<CommentResult | null>;

    deleteComment(convesationId: string, comment: CommentResult | string, user: User, final?: boolean): Promise<CommentDeletionResponse>

    updateComment(convesationId: string, comment: CommentResult, user: User): Promise<CommentResult>;

    vote(convesationId: string, comment: Comment | string, user: User, vote: Vote): Promise<CommentResult>

    report(convesationId: string, comment: Comment, user: User, reporttype: ReportType): Promise<CommentResult>

    react(convesationId: string, comment: Comment | string, user: User, reaction: Reaction, enable?: boolean): Promise<CommentResult>;

    getReplies(convesationId: string, comment: Comment | string, request?: CommentRequest): Promise<CommentListResponse>

    listComments(convesationId: string, request?: CommentRequest): Promise<CommentListResponse>

    listRepliesBatch(conversation: Conversation | string, parentids: string[], childlimit?: number): Promise<RepliesBatchResponse>
}