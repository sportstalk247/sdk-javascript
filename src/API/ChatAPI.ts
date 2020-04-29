/* istanbul ignore file */

import {
    AdvertisementOptions,
    CommandOptions, CommandResponse, DeletedRoomResponse,
    EventHandlerConfig,
    EventResult,
    GoalOptions,
    Room, RoomExitResult,
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

export interface IEventService extends ISportsTalkConfigurable, IUserConfigurable  {
    startTalk(),
    stopTalk(),
    setCurrentRoom(room: RoomResult | null): Room | null,
    setEventHandlers(eventHandlers: EventHandlerConfig),
    getCurrentRoom(): RoomResult | null,
    getUpdates(): Promise<EventResult[]>,
    reportEvent(event: EventResult | string, reason: ReportReason): Promise<MessageResult<null>>,
    sendCommand(user:User, command: string, options?: CommandOptions):  Promise<MessageResult<CommandResponse>>
    sendReply(user: User, message: string, replyto: string | Event, options?: CommandOptions): Promise<MessageResult<CommandResponse>>
    sendReaction(user: User,  reaction: Reaction, reactToMessageId: Event | string, options?: CommandOptions): Promise<MessageResult<CommandResponse>>
    sendAdvertisement(user: User, options: AdvertisementOptions): Promise<MessageResult<CommandResponse>>
    sendGoal(user: User, img: string, message?:string, options?: GoalOptions): Promise<MessageResult<CommandResponse>>
    getEventHandlers(): EventHandlerConfig
    deleteEvent(event: EventResult | string): Promise<MessageResult<null>>
}

export interface IRoomService extends ISportsTalkConfigurable {
    listRooms(): Promise<Array<Room>>
    deleteRoom(id: string | Room): Promise<DeletedRoomResponse>
    createRoom(room: Room): Promise<RoomResult>
    listParticipants(room: Room, cursor?: string, maxresults?: number): Promise<Array<UserResult>>
    listUserMessages(user: User | string, Room: Room | String, cursor?: string, limit?: number): Promise<Array<EventResult>>
    joinRoom(user: User, room: Room | string): Promise<RoomUserResult>
    exitRoom(user: User | string, room: Room | string): Promise<RoomExitResult>
}

export interface IChatClient extends IUserConfigurable, ISportsTalkConfigurable{
    sendCommand(command: string, options?: CommandOptions):  Promise<MessageResult<null | CommandResponse>>
    sendReply(message: string, replyto: string, options?: CommandOptions): Promise<MessageResult<null | CommandResponse>>
    sendReaction(reaction: Reaction, reactToMessageId: Event | string, options?: CommandOptions): Promise<MessageResult<null | CommandResponse>>
    sendAdvertisement(options: AdvertisementOptions): Promise<MessageResult<null | CommandResponse>>
    sendGoal(message?:string, img?: string, options?: GoalOptions): Promise<MessageResult<null | CommandResponse>>
    setDefaultGoalImage(url: string);
    report(event: EventResult | string, reason: ReportType):  Promise<MessageResult<null>>,
    listRooms(): Promise<Array<Room>>;
    joinRoom(room: RoomResult | string): Promise<RoomUserResult>;
    getCurrentRoom(): Room | null;
    setCurrentRoom(room:RoomResult);
    listParticipants(cursor?: string, maxresults?: number): Promise<Array<User>>;
    setEventHandlers(eventHandlers: EventHandlerConfig);
    getEventHandlers():EventHandlerConfig;
    createOrUpdateUser(user: User, setDefault?:boolean): Promise<User>
    getLatestEvents(): Promise<EventResult[]>
    startTalk();
    stopTalk();
}

export interface IChatModerationService extends ISportsTalkConfigurable {
    getModerationQueue(): Promise<Array<EventResult>>
    rejectEvent(event: EventResult): Promise<MessageResult<null>>
    approveEvent(event: EventResult): Promise<MessageResult<null>>
}

