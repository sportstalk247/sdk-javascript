/* istanbul ignore file */

import {
    AdvertisementOptions, ChatUpdatesResult,
    CommandOptions, CommandResponse, DeletedRoomResponse,
    EventHandlerConfig, EventListResponse,
    EventResult,
    GoalOptions,
    ChatRoom, ChatRoomExitResult, ChatRoomListResponse,
    ChatRoomResult,
    ChatRoomUserResult
} from "../models/ChatModels";

import {ISportsTalkConfigurable, IUserConfigurable} from "./CommonAPI";
import {
    ListRequest,
    MessageResult,
    Reaction,
    ReportReason,
    ReportType,
    RestApiResult,
    User, UserDeletionResponse, UserListResponse,
    UserResult, UserSearchType
} from "../models/CommonModels";

/**
 * Interface for the EventService, which handles chat events and any polling.
 */
export interface IChatEventService extends ISportsTalkConfigurable, IUserConfigurable  {
    startEventUpdates(),
    stopEventUpdates(),
    setCurrentRoom(room: ChatRoomResult | null): ChatRoom | null,
    setEventHandlers(eventHandlers: EventHandlerConfig),
    getCurrentRoom(): ChatRoomResult | null,
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
    listRooms(): Promise<ChatRoomListResponse>;
    deleteRoom(id: string | ChatRoom): Promise<DeletedRoomResponse>
    createRoom(room: ChatRoom): Promise<ChatRoomResult>
    updateRoom(room:ChatRoomResult): Promise<ChatRoomResult>
    closeRoom(room:ChatRoomResult | string): Promise<ChatRoomResult>
    openRoom(room:ChatRoomResult | string): Promise<ChatRoomResult>
    listParticipants(room: ChatRoom, cursor?: string, maxresults?: number): Promise<Array<UserResult>>
    listUserMessages(user: User | string, Room: ChatRoom | String, cursor?: string, limit?: number): Promise<Array<EventResult>>
    joinRoom(user: User, room: ChatRoom | string): Promise<ChatRoomUserResult>
    joinRoomByCustomId(user: User, room: ChatRoom | string): Promise<ChatRoomUserResult>
    exitRoom(user: User | string, room: ChatRoom | string): Promise<ChatRoomExitResult>
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
    listRooms(): Promise<ChatRoomListResponse>
    joinRoom(room: ChatRoomResult | string): Promise<ChatRoomUserResult>;
    joinRoomByCustomId(user: User, room: ChatRoom | string): Promise<ChatRoomUserResult>;
    createRoom(room): Promise<ChatRoomResult>;
    getCurrentRoom(): ChatRoom | null;
    setCurrentRoom(room:ChatRoomResult);
    listParticipants(cursor?: string, maxresults?: number): Promise<Array<User>>;
    setEventHandlers(eventHandlers: EventHandlerConfig);
    getEventHandlers():EventHandlerConfig;
    createOrUpdateUser(user: User, setDefault?:boolean): Promise<User>
    getLatestEvents(): Promise<ChatUpdatesResult>,
    updateRoom(room:ChatRoomResult): Promise<ChatRoomResult>
    startEventUpdates();
    stopEventUpdates();
    setBanStatus(user: User | string, isBanned: boolean): Promise<RestApiResult<UserResult>>
    createOrUpdateUser(user: User): Promise<UserResult>
    searchUsers(search: string, type: UserSearchType, limit?:number): Promise<UserListResponse>
    listUsers(request?: ListRequest): Promise<UserListResponse>
    deleteUser(user:User | string):Promise<UserDeletionResponse>
    getUserDetails(user: User | string): Promise<UserResult>
}

/**
 * Interface for Chat Moderation Services.
 */
export interface IChatModerationService extends ISportsTalkConfigurable {
    getModerationQueue(): Promise<EventListResponse>
    rejectEvent(event: EventResult): Promise<MessageResult<null>>
    approveEvent(event: EventResult): Promise<MessageResult<null>>
}

