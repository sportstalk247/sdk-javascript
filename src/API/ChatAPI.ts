import {
    AdvertisementOptions,
    CommandOptions, DeletedRoomResponse,
    EventHandlerConfig,
    EventResult,
    GoalOptions,
    Room,
    RoomResult,
    RoomUserResult
} from "../models/ChatModels";

import {ISportsTalkConfigurable, IUserConfigurable} from "./CommonAPI";
import {ApiResult, Reaction, ReportReason, ReportType, User, UserResult} from "../models/CommonModels";

export interface IEventManager extends ISportsTalkConfigurable, IUserConfigurable  {
    startTalk(),
    stopTalk(),
    setCurrentRoom(room: Room | null): Room | null,
    setEventHandlers(eventHandlers: EventHandlerConfig),
    getCurrentRoom(): Room | null,
    getUpdates(): Promise<EventResult[]>,
    reportEvent(event: EventResult | string, reason: ReportReason): Promise<ApiResult<null>>,
    sendCommand(user:User, command: string, options?: CommandOptions):  Promise<ApiResult<null | Event>>
    sendReply(user: User, message: string, replyto: string | Event, options?: CommandOptions): Promise<ApiResult<null>>
    sendReaction(user: User,  reaction: Reaction, reactToMessageId: Event | string, options?: CommandOptions): Promise<ApiResult<null>>
    sendAdvertisement(user: User, options: AdvertisementOptions): Promise<ApiResult<null>>
    sendGoal(user: User, img: string, message?:string, options?: GoalOptions): Promise<ApiResult<null>>
    getEventHandlers(): EventHandlerConfig
}

export interface IRoomManager extends ISportsTalkConfigurable {
    listRooms(): Promise<Array<Room>>
    deleteRoom(id: string | Room): Promise<DeletedRoomResponse>
    createRoom(room: Room): Promise<RoomResult>
    listParticipants(room: Room, cursor?: string, maxresults?: number): Promise<Array<UserResult>>
    listUserMessages(user: User | string, Room: Room | String, cursor?: string, limit?: number): Promise<Array<EventResult>>
    joinRoom(user: User, room: Room | string): Promise<RoomUserResult>
    exitRoom(user: User | string, room: Room | string): Promise<RoomUserResult>
}

export interface IChatClient extends IUserConfigurable, ISportsTalkConfigurable{
    sendCommand(command: string, options?: CommandOptions):  Promise<ApiResult<null | Event>>
    sendReply(message: string, replyto: string, options?: CommandOptions): Promise<ApiResult<null>>
    sendReaction(reaction: Reaction, reactToMessageId: Event | string, options?: CommandOptions): Promise<ApiResult<null>>
    sendAdvertisement(options: AdvertisementOptions): Promise<ApiResult<null>>
    sendGoal(message?:string, img?: string, options?: GoalOptions): Promise<ApiResult<null>>
    report(event: EventResult | string, reason: ReportType):  Promise<ApiResult<null>>,
    listRooms(): Promise<Array<Room>>;
    joinRoom(room: RoomResult | string): Promise<RoomUserResult>;
    getCurrentRoom(): Room | null;
    listParticipants(cursor?: string, maxresults?: number): Promise<Array<User>>;
    setEventHandlers(eventHandlers: EventHandlerConfig);
    createOrUpdateUser(user: User, setDefault?:boolean): Promise<User>
    getLatestEvents(): Promise<EventResult[]>
    startTalk();
    stopTalk();
}

export interface IChatModerationManager extends ISportsTalkConfigurable {
    getModerationQueue(): Promise<Array<EventResult>>
    rejectEvent(event: EventResult): Promise<ApiResult<null>>
    approveEvent(event: EventResult): Promise<ApiResult<null>>
}

