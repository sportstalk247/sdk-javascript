import {
    AdvertisementOptions,
    ApiResult,
    CommandOptions,
    EventHandlerConfig,
    EventResult, GoalOptions, Reaction,
    Room,
    RoomResult, RoomUserResult,
    SportsTalkConfig,
    User,
    UserResult, WebHook
} from "./DataModels";

import {Promise} from "es6-promise";

export interface IConfigurable {
    setConfig(config:SportsTalkConfig)
}

export interface IUserConfigurable {
    setUser(user:User)
}

export interface IEventManager extends IConfigurable, IUserConfigurable  {
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

export interface IRoomManager extends IConfigurable {
    listRooms(): Promise<Array<RoomResult>>
    deleteRoom(id: string | Room): Promise<ApiResult<null>>
    createRoom(room: Room): Promise<RoomResult>
    listParticipants(room: Room, cursor?: string, maxresults?: number): Promise<Array<UserResult>>
    joinRoom(user: User, room: Room | string): Promise<RoomUserResult>
    exitRoom(user: User | string, room: Room | string): Promise<RoomUserResult>
}

export interface ITalkClient extends IUserConfigurable, IConfigurable{
    sendCommand(command: string, options?: CommandOptions):  Promise<ApiResult<null | Event>>
    sendReply(message: string, replyto: string, options?: CommandOptions): Promise<ApiResult<null>>
    sendReaction(reaction: Reaction, reactToMessageId: Event | string, options?: CommandOptions): Promise<ApiResult<null>>
    sendAdvertisement(options: AdvertisementOptions): Promise<ApiResult<null>>
    sendGoal(message?:string, img?: string, options?: GoalOptions): Promise<ApiResult<null>>
}

export interface IUserManager extends IConfigurable {
    listUserMessages(user:User | string, cursor?: string, limit?: number): Promise<Array<EventResult>>
    setBanStatus(user: User | string, isBanned: boolean): Promise<ApiResult<UserResult>>
    createOrUpdateUser(user: User): Promise<UserResult>
}

export interface ISportsTalkClient extends ITalkClient {
    setEventHandlers(eventHandlers: EventHandlerConfig);
    startTalk();
    stopTalk();
    listRooms(): Promise<Array<RoomResult>>;
    joinRoom(room: RoomResult | string): Promise<RoomUserResult>;
    getCurrentRoom(): Room | null;
    listParticipants(cursor?: string, maxresults?: number): Promise<Array<UserResult>>;
}

export interface IModerationManager extends IConfigurable {

}

export interface IWebhookManager extends IConfigurable {
    listWebhooks(): Promise<WebHook[]>;
    createWebhook(hook: WebHook): Promise<WebHook>;
    updateWebhook(hook: WebHook): Promise<WebHook>;
    deleteWebhook(hook: WebHook | string): Promise<WebHook>;
}