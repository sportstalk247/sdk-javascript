import {IChatClientConfigurable,IUserConfigurable} from "../Configuration";
import {
    AdvertisementOptions,
    ChatEventsList,
    ChatRoom,
    ChatRoomResult,
    ChatUpdatesResult,
    CommandOptions,
    CommandResponse,
    EventHandlerConfig,
    EventResult,
    EventSearchParams,
    EventType,
    GoalOptions,
    TimestampRequest
} from "../../models/ChatModels";
import {ErrorResult, MessageResult, Reaction, ReportReason, RestApiResult, User} from "../../models/CommonModels";


/**
 * Interface for the EventService, which handles chat events and any polling.
 * @interface
 */
export interface IChatEventService extends IChatClientConfigurable, IUserConfigurable {
    startEventUpdates(),

    stopEventUpdates(),

    handleUpdates(results: ChatUpdatesResult);

    setCurrentRoom(room: ChatRoomResult | null): ChatRoom | null,

    setEventHandlers(eventHandlers: EventHandlerConfig),

    getCurrentRoom(): ChatRoomResult | null,

    getUpdates(cursor?: string): Promise<ChatUpdatesResult>,

    setUpdatesCursor(cursor: string),

    setPreviousEventsCursor(cursor: string),

    reportMessage(event: EventResult | string, reason: ReportReason): Promise<MessageResult<null>>,

    executeChatCommand(user: User, command: string, options?: CommandOptions): Promise<MessageResult<CommandResponse> | ErrorResult>;

    sendThreadedReply(user: User, message: string, replyto: EventResult | string, options?: CommandOptions): Promise<MessageResult<CommandResponse>>

    sendQuotedReply(user: User, message: string, replyto: EventResult | string, options?: CommandOptions): Promise<MessageResult<CommandResponse>>

    reactToEvent(user: User, reaction: Reaction | string, reactToMessage: EventResult | string, options?: CommandOptions): Promise<MessageResult<CommandResponse>>

    sendAdvertisement(user: User, options: AdvertisementOptions): Promise<MessageResult<CommandResponse>>

    sendGoal(user: User, img: string, message?: string, options?: GoalOptions): Promise<MessageResult<CommandResponse>>

    getEventHandlers(): EventHandlerConfig

    flagEventLogicallyDeleted(user: User | string, event: EventResult | string, permanentIfNoReplies: boolean): Promise<RestApiResult<null>>

    permanetlyDeleteEvent(user: User | string, event: EventResult | string): Promise<RestApiResult<null>>

    listPreviousEvents(cursor?: string, limit?: number): Promise<ChatUpdatesResult>

    listEventsHistory(cursor?: string, limit?: number): Promise<ChatUpdatesResult>

    setUpdateSpeed(speed: number);

    searchEventHistory(params: EventSearchParams): Promise<any>

    updateChatEvent(event: EventResult | string, body: string, user?: string | User): Promise<EventResult>

    listEventsByType(type: EventType): Promise<ChatEventsList>

    listEventsByTimestamp(query: TimestampRequest): Promise<ChatEventsList>
}