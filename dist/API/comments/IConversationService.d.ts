import { IConfigurable } from "../Configuration";
import { Conversation, ConversationDeletionResponse, ConversationDetailsListResponse, ConversationListResponse, ConversationRequest, ConversationResponse } from "../../models/CommentsModels";
/**
 * @interface
 */
export interface IConversationService extends IConfigurable {
    createConversation(settings: Conversation): Promise<ConversationResponse>;
    getConversation(conversation: Conversation | string): Promise<ConversationResponse>;
    getConversationByCustomId(conversation: Conversation | string): Promise<ConversationResponse>;
    listConversations(filter?: ConversationRequest): Promise<ConversationListResponse>;
    deleteConversation(conversation: Conversation | string): Promise<ConversationDeletionResponse>;
    getConversationBatchDetails(conversation: Conversation[] | string[]): Promise<ConversationDetailsListResponse>;
}
