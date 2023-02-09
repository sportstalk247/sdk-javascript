import {IConfigurable} from "../Configuration";
import {
    Conversation, ConversationBatchListOptions,
    ConversationDeletionResponse,
    ConversationDetailsListResponse,
    ConversationListResponse,
    ConversationRequest,
    ConversationResponse, User
} from "../../models/CommentsModels";
import {ReactionCommand} from "../../models/CommonModels";
import {UserResult} from "../../models/user/User";

/**
 * @interface
 */
export interface IConversationService extends IConfigurable {
    createConversation(settings: Conversation): Promise<ConversationResponse>;

    getConversation(conversation: Conversation | string): Promise<ConversationResponse>;

    getConversationByCustomId(conversation: Conversation | string): Promise<ConversationResponse>

    listConversations(filter?: ConversationRequest): Promise<ConversationListResponse>

    deleteConversation(conversation: Conversation | string): Promise<ConversationDeletionResponse>

    getConversationBatchDetails(conversation: Conversation[] | string[], options?:ConversationBatchListOptions ): Promise<ConversationDetailsListResponse>

    reactToConversationTopic(conversation: Conversation | string, reaction?: ReactionCommand, user?: User): Promise<ConversationResponse>
}