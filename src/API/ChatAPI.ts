import {
    AdvertisementOptions,
    CommandOptions,
    EventHandlerConfig,
    EventResult,
    GoalOptions,
    Room,
    RoomResult,
    RoomUserResult,
    ChatWebHook
} from "../models/ChatModels";

import {Promise} from "es6-promise";
import {ISportsTalkConfigurable, IUserConfigurable} from "./CommonAPI";
import {ApiResult, Reaction, User, UserResult} from "../models/CommonModels";

export interface IEventManager extends ISportsTalkConfigurable, IUserConfigurable  {
    startTalk(),
    stopTalk(),
    setCurrentRoom(room: Room | null): Room | null,
    setEventHandlers(eventHandlers: EventHandlerConfig),
    getCurrentRoom(): Room | null,
    getUpdates(): Promise<EventResult[]>
    sendCommand(user:User, room: Room, command: string, options?: CommandOptions):  Promise<ApiResult<null | Event>>
    sendReply(user: User, room: Room, message: string, replyto: string | Event, options?: CommandOptions): Promise<ApiResult<null>>
    sendReaction(user: User, room: Room, reaction: Reaction, reactToMessageId: Event | string, options?: CommandOptions): Promise<ApiResult<null>>
    sendAdvertisement(user: User, room: Room, options: AdvertisementOptions): Promise<ApiResult<null>>
    sendGoal(user: User, room: Room, img: string, message?:string, options?: GoalOptions): Promise<ApiResult<null>>
    getEventHandlers(): EventHandlerConfig
}

export interface IRoomManager extends ISportsTalkConfigurable {
    listRooms(): Promise<Array<RoomResult>>
    deleteRoom(id: string | Room): Promise<ApiResult<null>>
    createRoom(room: Room): Promise<RoomResult>
    listParticipants(room: Room, cursor?: string, maxresults?: number): Promise<Array<UserResult>>
    joinRoom(user: User, room: Room | string): Promise<RoomUserResult>
    exitRoom(user: User | string, room: Room | string): Promise<RoomUserResult>
}

export interface ITalkClient extends IUserConfigurable, ISportsTalkConfigurable{
    sendCommand(command: string, options?: CommandOptions):  Promise<ApiResult<null | Event>>
    sendReply(message: string, replyto: string, options?: CommandOptions): Promise<ApiResult<null>>
    sendReaction(reaction: Reaction, reactToMessageId: Event | string, options?: CommandOptions): Promise<ApiResult<null>>
    sendAdvertisement(options: AdvertisementOptions): Promise<ApiResult<null>>
    sendGoal(message?:string, img?: string, options?: GoalOptions): Promise<ApiResult<null>>
}

export interface IUserManager extends ISportsTalkConfigurable {
    listUserMessages(user:User | string, cursor?: string, limit?: number): Promise<Array<EventResult>>
    setBanStatus(user: User | string, isBanned: boolean): Promise<ApiResult<UserResult>>
    createOrUpdateUser(user: User): Promise<UserResult>
}

export interface IChatClient extends ITalkClient {
    setEventHandlers(eventHandlers: EventHandlerConfig);
    startTalk();
    stopTalk();
    listRooms(): Promise<Array<RoomResult>>;
    joinRoom(room: RoomResult | string): Promise<RoomUserResult>;
    getCurrentRoom(): Room | null;
    listParticipants(cursor?: string, maxresults?: number): Promise<Array<UserResult>>;
}

export interface IModerationManager extends ISportsTalkConfigurable {

}

export interface IWebhookManager extends ISportsTalkConfigurable {
    listWebhooks(): Promise<ChatWebHook[]>;
    createWebhook(hook: ChatWebHook): Promise<ChatWebHook>;
    updateWebhook(hook: ChatWebHook): Promise<ChatWebHook>;
    deleteWebhook(hook: ChatWebHook | string): Promise<ChatWebHook>;
}