/**
 * Models used by Chat API and API Responses
 */
import {RestApiResult, Kind, User, UserResult, MessageResult, ListResponse} from "./CommonModels";

export enum EventType {
    speech = "speech",
    purge = "purge",
    reaction = "reaction",
    roomClosed = "roomclosed",
    roomOpen = "roomopen",
    action = "action",
    reply = "reply"
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
    onNetworkResponse?(response: RestApiResult<any>);
    onChatEvent?(event: EventResult),
    onGoalEvent?(event: EventResult),
    onAdEvent?(event: EventResult),
    onReply?(event: EventResult),
    onReaction?(event:EventResult),
    onPurgeEvent?(event:EventResult),
    onAdminCommand?(response: RestApiResult<Kind.api>),
    onHelp?(result: MessageResult<Event | CommandResponse | null>),
    onNetworkError?(error: Error)
    onRoomChange?(oldRoom?:Room, newRoom?:Room)
}

export interface JoinRoomResponse {
    room: Room,
    user: User
}

export interface DeletedRoomResponse {
    kind: Kind.deletedroom,
    deletedEventsCount: number,
    room: Room
}

export interface CommandResponse {
    speech?: Event
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

export enum RoomExitResult {
    success = "Success"
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
    enableprofanityfilter?: boolean,
    delaymessageseconds?: number,
    enableactions?: boolean,
    roomisopen?: boolean, // allows chat
    maxreports?: number, // defaults to 3. The number of flags it takes to add a comment to the moderation queue.
    enableenterAndexit?: boolean,
    throttle?: number //(optional) Defaults to 0. This is the number of seconds to delay new incomming messags so that the chat room doesn't scroll messages too fast.
}

export interface RoomResult extends Room {
    id: string,
    kind?: Kind.room,  //"chat.room"
    ownerid?:string,
    inroom?:number,
    whenmodified?:string
}

export interface RoomListResponse extends ListResponse {
    kind: Kind.roomlist,
    rooms: Array<RoomResult>,
}

export interface EventResult {
    kind: Kind.chat,
    id?: string,
    roomid: string,
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

export interface ChatUpdatesResult {
    kind: Kind.chatlist,
    cursor: string
    more: boolean
    itemcount: number
    room: RoomResult,
    events: [EventResult]
}
