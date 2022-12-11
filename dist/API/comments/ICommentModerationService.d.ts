import { IConfigurable } from "../Configuration";
import { Comment, CommentListResponse } from "../../models/CommentsModels";
/**
 * @interface
 */
export interface ICommentModerationService extends IConfigurable {
    listCommentsInModerationQueue(): Promise<CommentListResponse>;
    rejectComment(comment: Comment): Promise<Comment>;
    approveComment(comment: Comment): Promise<Comment>;
}
