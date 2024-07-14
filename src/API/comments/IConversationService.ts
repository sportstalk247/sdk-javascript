import {IConfigurable} from "../Configuration";
import {
    Conversation, ConversationBatchListOptions,
    ConversationDeletionResponse,
    ConversationDetailsListResponse,
    ConversationListResponse,
    ConversationRequest,
    ConversationResponse, HasConversationID, User
} from "../../models/CommentsModels";
import {ReactionCommand, HasCustomId} from "../../models/CommonModels";

/**
 * @interface
 */
export interface IConversationService extends IConfigurable {
    createConversation(settings: Conversation): Promise<ConversationResponse>;

    resetConversation(conversation:HasConversationID | string):Promise<ConversationResponse>;

    getConversation(conversation: HasConversationID | string): Promise<ConversationResponse>;

    getConversationByCustomId(conversation: HasCustomId | string): Promise<ConversationResponse>

    listConversations(filter?: ConversationRequest): Promise<ConversationListResponse>

    deleteConversation(conversation: HasConversationID | string): Promise<ConversationDeletionResponse>

    getConversationBatchDetails(conversation: HasConversationID[] | string[], options?:ConversationBatchListOptions ): Promise<ConversationDetailsListResponse>

    reactToConversationTopic(conversation: HasConversationID | string, reaction?: ReactionCommand, user?: User): Promise<ConversationResponse>
}