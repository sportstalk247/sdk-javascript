import {ISportsTalkConfigurable} from "../Configuration";
import {ChatModerationQueueListRequest, User} from "../../models/CommonModels";
import {ChatRoomEffectsList, ChatRoomResult, EventListResponse, EventResult} from "../../models/ChatModels";

/**
 * Interface for Chat Moderation Services.
 * @interface
 */
export interface IChatModerationService extends ISportsTalkConfigurable {
    listMessagesInModerationQueue(moderationQueueRequest: ChatModerationQueueListRequest): Promise<EventListResponse>

    moderateEvent(event: EventResult, approved: boolean): Promise<EventResult>

    applyFlagModerationDecision(user: User | string, room: ChatRoomResult | string, approve: boolean)

    listRoomEffects(room: ChatRoomResult | string): Promise<ChatRoomEffectsList>

    unMuteUserInRoom(user: User | string, room: ChatRoomResult | string): Promise<any>

    muteUserInRoom(user: User | string, room: ChatRoomResult | string, expireseconds?: number): Promise<any>

    shadowbanUserInRoom(user: User | string, room: ChatRoomResult | string, expiresSeconds?: number): Promise<ChatRoomResult>

    unShadowbanUserInRoom(user: User | string, room: ChatRoomResult | string): Promise<ChatRoomResult>

    purgeMessagesInRoom(user: User | string, room: ChatRoomResult | string): Promise<any>
}