import { ISportsTalkConfigurable } from "../Configuration";
import { EventListResponse, EventResult } from "../../models/ChatModels";
import { ChatRoomEffectsList, ChatRoomResult } from "../../models/chat/ChatRoom";
import { User } from "../../models/user/User";
import { ChatModerationQueueListRequest } from "../../models/Moderation";
/**
 * Interface for Chat Moderation Services.
 * @interface
 */
export interface IChatModerationService extends ISportsTalkConfigurable {
    listMessagesInModerationQueue(moderationQueueRequest: ChatModerationQueueListRequest): Promise<EventListResponse>;
    moderateEvent(event: EventResult, approved: boolean): Promise<EventResult>;
    applyFlagModerationDecision(user: User | string, room: ChatRoomResult | string, approve: boolean): any;
    listRoomEffects(room: ChatRoomResult | string): Promise<ChatRoomEffectsList>;
    unMuteUserInRoom(user: User | string, room: ChatRoomResult | string): Promise<any>;
    muteUserInRoom(user: User | string, room: ChatRoomResult | string, expireseconds?: number): Promise<any>;
    shadowbanUserInRoom(user: User | string, room: ChatRoomResult | string, expiresSeconds?: number): Promise<ChatRoomResult>;
    unShadowbanUserInRoom(user: User | string, room: ChatRoomResult | string): Promise<ChatRoomResult>;
    purgeMessagesInRoom(user: User | string, room: ChatRoomResult | string): Promise<any>;
}
