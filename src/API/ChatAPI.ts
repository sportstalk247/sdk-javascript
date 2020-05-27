/* istanbul ignore file */

import {
    AdvertisementOptions, ChatUpdatesResult,
    CommandOptions, CommandResponse, DeletedChatRoomResponse,
    EventHandlerConfig, EventListResponse,
    EventResult,
    GoalOptions,
    ChatRoom, ChatRoomExitResult, ChatRoomListResponse,
    ChatRoomResult,
    JoinChatRoomResponse
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
    handleUpdates(results: ChatUpdatesResult);
    setCurrentRoom(room: ChatRoomResult | null): ChatRoom | null,
    setEventHandlers(eventHandlers: EventHandlerConfig),
    getCurrentRoom(): ChatRoomResult | null,
    getUpdates(): Promise<ChatUpdatesResult>,
    reportMessage(event: EventResult | string, reason: ReportReason): Promise<MessageResult<null>>,
    executeChatCommand(user:User, command: string, options?: CommandOptions):  Promise<MessageResult<CommandResponse>>
    sendQuotedReply(user: User, message: string, replyto: string | EventResult, options?: CommandOptions): Promise<MessageResult<CommandResponse>>
    reactToEvent(user: User, reaction: Reaction | string, reactToMessage: EventResult | string, options?: CommandOptions): Promise<MessageResult<CommandResponse>>
    sendAdvertisement(user: User, options: AdvertisementOptions): Promise<MessageResult<CommandResponse>>
    sendGoal(user: User, img: string, message?:string, options?: GoalOptions): Promise<MessageResult<CommandResponse>>
    getEventHandlers(): EventHandlerConfig
    flagEventLogicallyDeleted(user: UserResult | string, event:EventResult | string, permanentIfNoReplies:boolean):Promise<RestApiResult<null>>
    permanetlyDeleteEvent(user: UserResult | string, event: EventResult | string):Promise<RestApiResult<null>>
    listPreviousEvents(cursor?:string, limit?: number): Promise<ChatUpdatesResult>
    listEventsHistory(cursor?:string, limit?: number): Promise<ChatUpdatesResult>
}

/**
 * Interface for room management
 */
export interface IRoomService extends ISportsTalkConfigurable {
    listRooms(): Promise<ChatRoomListResponse>;
    getRoomDetails(room:ChatRoomResult | string): Promise<ChatRoomResult>
    getRoomDetailsByCustomId(room:ChatRoomResult | string): Promise<ChatRoomResult>
    deleteRoom(id: string | ChatRoom): Promise<DeletedChatRoomResponse>
    createRoom(room: ChatRoom): Promise<ChatRoomResult>
    updateRoom(room:ChatRoomResult): Promise<ChatRoomResult>
    closeRoom(room:ChatRoomResult | string): Promise<ChatRoomResult>
    openRoom(room:ChatRoomResult | string): Promise<ChatRoomResult>
    listParticipants(room: ChatRoom, cursor?: string, maxresults?: number): Promise<Array<UserResult>>
    listUserMessages(user: User | string, Room: ChatRoom | String, cursor?: string, limit?: number): Promise<Array<EventResult>>
    joinRoom(room: ChatRoom | string, user: User): Promise<JoinChatRoomResponse>
    joinRoomByCustomId( room: ChatRoom | string, user: User): Promise<JoinChatRoomResponse>
    exitRoom(user: User | string, room: ChatRoom | string): Promise<ChatRoomExitResult>
}

/**
 * Interface for ChatClient.
 *
 * For most user-facing chat implementations, this is the only class you need.
 */
export interface IChatClient extends IUserConfigurable, ISportsTalkConfigurable{
    executeChatCommand(command: string, options?: CommandOptions):  Promise<MessageResult<null | CommandResponse>>
    sendReply(message: string, replyto: string, options?: CommandOptions): Promise<MessageResult<null | CommandResponse>>
    reactToEvent(reaction: Reaction, reactToMessage: EventResult | string, options?: CommandOptions): Promise<MessageResult<null | CommandResponse>>
    sendAdvertisement(options: AdvertisementOptions): Promise<MessageResult<null | CommandResponse>>
    sendGoal(message?:string, img?: string, options?: GoalOptions): Promise<MessageResult<null | CommandResponse>>
    setDefaultGoalImage(url: string);
    reportMessage(event: EventResult | string, reason: ReportType):  Promise<MessageResult<null>>,
    listRooms(): Promise<ChatRoomListResponse>
    joinRoom(room: ChatRoomResult | string): Promise<JoinChatRoomResponse>;
    joinRoomByCustomId(room: ChatRoom | string): Promise<JoinChatRoomResponse>;
    createRoom(room): Promise<ChatRoomResult>;
    getCurrentRoom(): ChatRoom | null;
    setCurrentRoom(room:ChatRoomResult);
    listParticipants(cursor?: string, maxresults?: number): Promise<Array<User>>;
    setEventHandlers(eventHandlers: EventHandlerConfig);
    getEventHandlers():EventHandlerConfig;
    createOrUpdateUser(user: User, setDefault?:boolean): Promise<User>
    getUpdates(): Promise<ChatUpdatesResult>,
    updateRoom(room:ChatRoomResult): Promise<ChatRoomResult>
    startListeningToEventUpdates();
    stopListeningToEventUpdates();
    listPreviousEvents(cursor?:string, limit?: number): Promise<ChatUpdatesResult>
    permanetlyDeleteEvent(event: EventResult | string): Promise<MessageResult<null>>
    flagEventLogicallyDeleted(event: EventResult | string): Promise<MessageResult<null>>
    setBanStatus(user: User | string, isBanned: boolean): Promise<RestApiResult<UserResult>>
    createOrUpdateUser(user: User): Promise<UserResult>
    searchUsers(search: string, type: UserSearchType, limit?:number): Promise<UserListResponse>
    listUsers(request?: ListRequest): Promise<UserListResponse>
    deleteUser(user:User | string):Promise<UserDeletionResponse>
    getUserDetails(user: User | string): Promise<UserResult>
    messageIsReported(event: EventResult): Boolean
    messageIsReactedTo(event: EventResult, reaction:Reaction | string): Boolean
}

/**
 * Interface for Chat Moderation Services.
 */
export interface IChatModerationService extends ISportsTalkConfigurable {
    listMessagesInModerationQueue(): Promise<EventListResponse>
    moderateEvent(event: EventResult, approved: boolean): Promise<MessageResult<null>>
}

