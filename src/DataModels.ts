/**
 * Models used by API Result Models.
 */
export enum EventType {
    speech = "speech",
    purge = "purge",
    reaction = "reaction",
    roomClosed = "roomclosed",
    roomOpen = "roomopen",
    action = "action",
    reply = "reply"
}

export enum ModerationType {
    pre = "pre",
    post = "post"
}

export enum WebhookType {
    prepublish = "prepublish",
    postpublish = "postpublish"
}

export enum WebhookEvent {
    speech = "speech",
    custom = "custom",
    reply = "reply",
    reaction = "reaction",
    action ="action",
    enter = "enter",
    exit = "exit",
    roomopened = "roomopened",
    roomclosed = "roomclosed",
    purge = "purge"
}

export enum Kind {
    chat = "chat.event",
    room = "chat.room",
    user = "chat.user",
    api = "api.result",
    webhook = "chat.webhook"
}

export enum Reaction {
    like = 'like'
}

/**
 * Used as an optional part of the constructor for a SportsTalk client.
 * Each property can also be set individually.
 */
export interface SportsTalkConfig {
    appId?: string,
    apiKey?: string,
    endpoint?: string,
    user?: User,
}

export interface RoomUserResult {
    user: UserResult,
    room: RoomResult
}

/**
 * Also an optional member of the constructor.
 * Takes a full set of the possible event handlers.
 * Each handler can also be set individually.
 */
export interface EventHandlerConfig {
    onChatStart?: Function;
    onNetworkResponse?(response: ApiResult<any>);
    onChatEvent?(event: EventResult),
    onGoalEvent?(event: EventResult),
    onAdEvent?(event: EventResult),
    onReply?(event: EventResult),
    onReaction?(event:EventResult),
    onPurgeEvent?(event:EventResult),
    onAdminCommand?(response: ApiResult<Kind.api>),
    onHelp?(result:ApiResult<any>),
    onNetworkError?(error: Error)
}

export interface JoinRoomResponse {
    room: Room,
    user: User
}

/**
 * All API responses take the form of an ApiResult.  This includes ApiResult<null>.
 * For instance, the 200 response to a chat command is of the type ApiResult<null>
 */
export interface ApiResult<T> {
    kind: Kind.api,
    message:string, // "Success"
    errors: object,
    code:number,  //e.g. 200, 400
    data:[T]
}

/**
 * Chat commands.
 */
export interface CommandOptions {
    customtype?: string,
    customid?: string,
    replyto?: string,
    custompayload?: string
}

export interface AdvertisementOptions {
    img: string,
    link: string,
    id?: string,
}
export interface GoalOptions {
    score?: object,
    link?: string,
    id?: string,
    commentary?: string,
    side?: string
}

/**
 * API Result Objects
 */
export interface Room {
    id?: string,
    name:string,
    description?: string,
    moderation?: string,
    slug?: string,
    enableActions?: boolean,
    roomisopen?: boolean,
    enableEnterAndExit?: boolean,
}

export interface RoomResult extends Room {
    kind: Kind.room,  //"chat.room"
    ownerid:string,
    inroom:number,
    whenmodified:string
}

export interface User {
    userid: string,
    handle: string,
    handlelowercase?: string,
    displayname?: string,
    pictureurl?: string,
    profileurl?: string,
    banned?:boolean
}

export interface UserResult extends User {
    kind?: Kind.user
}
export interface EventResult extends Event {
    kind: Kind.chat,
    id: string,
    roomId: string,
    added: number,
    body: string,
    eventtype: EventType,
    userid:string
    user: UserResult
    customtype?:string,
    customid?:string,
    custompayload?:object,
    replyto?:object,
    reactions?:Array<EventResult>
}

export interface WebHook {
    id?: string,
    kind?: Kind.webhook,
    label: string,
    url: string,
    enabled: boolean,
    type: WebhookType,
    events: WebhookEvent[]
}