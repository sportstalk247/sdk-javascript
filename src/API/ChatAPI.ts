/* istanbul ignore file */

import {
    AdvertisementOptions, ChatUpdatesResult,
    CommandOptions, CommandResponse, DeletedRoomResponse,
    EventHandlerConfig, EventListResponse,
    EventResult,
    GoalOptions,
    Room, RoomExitResult, RoomListResponse,
    RoomResult,
    RoomUserResult
} from "../models/ChatModels";

import {ISportsTalkConfigurable, IUserConfigurable} from "./CommonAPI";
import {
    MessageResult,
    Reaction,
    ReportReason,
    ReportType,
    RestApiResult,
    User,
    UserResult
} from "../models/CommonModels";

/**
 * Interface for the EventService, which handles chat events and any polling.
 */
export interface IChatEventService extends ISportsTalkConfigurable, IUserConfigurable  {
    startEventUpdates(),
    stopEventUpdates(),
    setCurrentRoom(room: RoomResult | null): Room | null,
    setEventHandlers(eventHandlers: EventHandlerConfig),
    getCurrentRoom(): RoomResult | null,
    getUpdates(): Promise<ChatUpdatesResult>,
    reportEvent(event: EventResult | string, reason: ReportReason): Promise<MessageResult<null>>,
    sendCommand(user:User, command: string, options?: CommandOptions):  Promise<MessageResult<CommandResponse>>
    sendReply(user: User, message: string, replyto: string | EventResult, options?: CommandOptions): Promise<MessageResult<CommandResponse>>
    sendReaction(user: User,  reaction: Reaction, reactToMessage: EventResult | string, options?: CommandOptions): Promise<MessageResult<CommandResponse>>
    sendAdvertisement(user: User, options: AdvertisementOptions): Promise<MessageResult<CommandResponse>>
    sendGoal(user: User, img: string, message?:string, options?: GoalOptions): Promise<MessageResult<CommandResponse>>
    getEventHandlers(): EventHandlerConfig
    deleteEvent(event: EventResult | string): Promise<MessageResult<null>>
}

/**
 * Interface for room management
 */
export interface IRoomService extends ISportsTalkConfigurable {
    listRooms(): Promise<RoomListResponse>;
    deleteRoom(id: string | Room): Promise<DeletedRoomResponse>
    createRoom(room: Room): Promise<RoomResult>
    updateRoom(room:RoomResult): Promise<RoomResult>
    closeRoom(room:RoomResult | string): Promise<RoomResult>
    openRoom(room:RoomResult | string): Promise<RoomResult>
    listParticipants(room: Room, cursor?: string, maxresults?: number): Promise<Array<UserResult>>
    listUserMessages(user: User | string, Room: Room | String, cursor?: string, limit?: number): Promise<Array<EventResult>>
    joinRoom(user: User, room: Room | string): Promise<RoomUserResult>
    joinRoomByCustomId(user: User, room: Room | string): Promise<RoomUserResult>
    exitRoom(user: User | string, room: Room | string): Promise<RoomExitResult>
}

/**
 * Interface for ChatClient.
 *
 * For most user-facing chat implementations, this is the only class you need.
 */
export interface IChatClient extends IUserConfigurable, ISportsTalkConfigurable{
    sendCommand(command: string, options?: CommandOptions):  Promise<MessageResult<null | CommandResponse>>
    sendReply(message: string, replyto: string, options?: CommandOptions): Promise<MessageResult<null | CommandResponse>>
    sendReaction(reaction: Reaction, reactToMessage: EventResult | string, options?: CommandOptions): Promise<MessageResult<null | CommandResponse>>
    sendAdvertisement(options: AdvertisementOptions): Promise<MessageResult<null | CommandResponse>>
    sendGoal(message?:string, img?: string, options?: GoalOptions): Promise<MessageResult<null | CommandResponse>>
    setDefaultGoalImage(url: string);
    report(event: EventResult | string, reason: ReportType):  Promise<MessageResult<null>>,
    listRooms(): Promise<RoomListResponse>
    joinRoom(room: RoomResult | string): Promise<RoomUserResult>;
    joinRoomByCustomId(user: User, room: Room | string): Promise<RoomUserResult>;
    createRoom(room): Promise<RoomResult>;
    getCurrentRoom(): Room | null;
    setCurrentRoom(room:RoomResult);
    listParticipants(cursor?: string, maxresults?: number): Promise<Array<User>>;
    setEventHandlers(eventHandlers: EventHandlerConfig);
    getEventHandlers():EventHandlerConfig;
    createOrUpdateUser(user: User, setDefault?:boolean): Promise<User>
    getLatestEvents(): Promise<ChatUpdatesResult>,
    updateRoom(room:RoomResult): Promise<RoomResult>
    startEventUpdates();
    stopEventUpdates();
}

/**
 * Interface for Chat Moderation Services.
 */
export interface IChatModerationService extends ISportsTalkConfigurable {
    getModerationQueue(): Promise<EventListResponse>
    rejectEvent(event: EventResult): Promise<MessageResult<null>>
    approveEvent(event: EventResult): Promise<MessageResult<null>>
}

