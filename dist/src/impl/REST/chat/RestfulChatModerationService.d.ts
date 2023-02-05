import { EventListResponse, EventResult } from "../../../models/ChatModels";
import { SportsTalkConfig } from "../../../models/CommonModels";
import { IChatModerationService } from "../../../API/chat/IChatModerationServive";
import { ChatRoomEffectsList, ChatRoomResult } from "../../../models/chat/ChatRoom";
import { User } from "../../../models/user/User";
import { ChatModerationQueueListRequest } from "../../../models/Moderation";
/**
 * This class is for moderating chat events.  Most clients will not need this unless you are building a custom moderation UI.
 * @class
 */
export declare class RestfulChatModerationService implements IChatModerationService {
    private _config;
    private _jsonHeaders;
    private _refreshFn;
    private _apiExt;
    private _handleRefresh;
    constructor(config: SportsTalkConfig);
    /**
     * Set the configuration
     * @param config
     */
    setConfig(config: SportsTalkConfig): void;
    /**
     * Get the moderation queue of events.
     */
    listMessagesInModerationQueue: (request?: ChatModerationQueueListRequest) => Promise<EventListResponse>;
    /**
     * Reject an event, removing it from the chat.
     * @param event
     */
    moderateEvent: (event: EventResult, approved: boolean) => Promise<EventResult>;
    listRoomEffects: (room: ChatRoomResult | string) => Promise<ChatRoomEffectsList>;
    applyFlagModerationDecision: (user: User | string, room: ChatRoomResult | string, approve: boolean) => any;
    muteUserInRoom: (user: User | string, room: ChatRoomResult | string, expireseconds?: number | undefined) => any;
    unMuteUserInRoom: (user: User | string, room: ChatRoomResult | string) => any;
    shadowbanUserInRoom: (user: User | string, room: ChatRoomResult | string, expiresSeconds?: number | undefined) => Promise<ChatRoomResult>;
    unShadowbanUserInRoom: (user: User | string, room: ChatRoomResult | string) => Promise<ChatRoomResult>;
    purgeMessagesInRoom: (user: User | string, room: ChatRoomResult | string) => Promise<any>;
}
