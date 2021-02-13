/**
 * Models used by Chat API and API Responses
 */
import {
    RestApiResult,
    Kind,
    User,
    UserResult,
    MessageResult,
    ListResponse,
    ModerationType,
    ReportReason, Reaction
} from "./CommonModels";
import {ErrorHandlerFunction} from "../impl/network";

export enum EventType  {
    speech= "speech",
    purge= "purge",
    bounce = "bounce",
    reaction= "reaction",
    replace="replace",
    remove="remove",
    roomClosed= "roomclosed",
    roomOpen="roomopened",
    action="action",
    reply="reply", // threaded replies
    quote= "quote",
    ad="ad",
    exit="exit",
    enter="enter",
    announcement="announcement",
    custom="custom"
}

export const CustomEventTypes = {
    goal:"goal" // custom type
} as const;


export interface JoinChatRoomResponse {
    user: UserResult,
    room: ChatRoomResult
    eventscursor: ChatUpdatesResult
    previouseventscursor?: string
}

/**
 * Also an optional member of the constructor.
 * Takes a full set of the possible event handlers.
 * Each handler can also be set individually.
 */
export interface EventHandlerConfig {
    onChatStart?: Function;
    onNetworkResponse?(response: any): void;
    onChatEvent?(event: EventResult):void, // not mandatory but absolutely should be set in 99% of cases.
    onGoalEvent?(event: EventResult):void,
    onAdEvent?(event: EventResult):void,
    onAnnouncement?(event: EventResult):void,
    onReply?(event: EventResult):void,
    onReplace?(event: EventResult):void,
    onRemove?(event: EventResult):void,
    onReaction?(event:EventResult):void,
    onPurgeEvent?(event:EventResult):void,
    onAdminCommand?(response: RestApiResult<Kind.api>):void,
    onHelp?(result: MessageResult<Event | CommandResponse | null>):void,
    onNetworkError?:ErrorHandlerFunction<any>,
    onRoomChange?(newRoom?:ChatRoom, oldRoom?:ChatRoom):void
}

export interface JoinRoomResponse {
    room: ChatRoom,
    user: User
}

export interface DeletedChatRoomResponse {
    kind: Kind.deletedroom,
    deletedEventsCount: number,
    room: ChatRoom
}

export interface CommandResponse {
    kind: Kind.chatcommand,
    op: string,
    room?: ChatRoomResult,
    speech?: EventResult
    action?: any
}

export enum ChatOptionsEventType {
    announcement="announcement",
    custom="custom", // indicates use of customEventtype.  Needs to be set to use customttype field
    ad="ad"
}
/**
 * Chat commands.
 */
export interface CommandOptions {
    eventtype?: ChatOptionsEventType,
    customtype?: string,
    customid?: string,
    custompayload?: string,
}

export interface QuoteCommandOptions extends CommandOptions {
    customfield1?: string,
    customfield2?: string,
    customtags?: string[]
}

/**
 * Describes the options for the 'advertisement' custom type
 */
export interface AdvertisementOptions {
    message?: string,
    img: string,
    link: string,
    id?: string,
}

/**
 * Describes the options for the 'goal' custom type
 */
export interface GoalOptions {
    score?: object, // An object representing the current score of the game.
    link?: string, // a full URL. How this will be used depends on the chat app implementaiton
    id?: string, // the goal ID, if relevant for your sport or your backend system
    commentary?: string, // A comment body on the goal, e.g. 'Eden executes an incredible kick and scores 1 against Arsenal`
    side?: string, // A string representation of which 'side' the goal is by.  Usage depends on chat implementation.
}

/**
 * The response messsages for a RoomExit action.
 */
export enum ChatRoomExitResult {
    success = "Success"
}

/**
 * API Result Objects
 */
/**
 * Describes a chat room.
 */
export interface ChatRoom {
    id?: string, // set by server on creation.
    name:string, //The name of the room
    description?: string, // optional room description
    moderation?: ModerationType, // 'pre' or 'post'
    slug?:string,// The room slug, migrated to customid
    customid?: string, // Custom ID to match internal systems.
    customtags?: string[],
    pictureurl?: string, // full URL to a cover image for chat room.
    enableprofanityfilter?: boolean, //Defaults to true, events in room will have profanity filtered (in English).
    delaymessageseconds?: number, // Delays messages, used for throttling. Defaults to zero and most of the time that's what you will want.
    enableactions?: boolean, // Whether or not users can utilize action commands.
    roomisopen?: boolean, // allows chat
    maxreports?: number, // defaults to 3. The number of flags it takes to add a comment to the moderation queue.
    enableenterandexit?: boolean, // Whether the room allows people to enter.  This is different than being open.  A room that denies entry can still be open and therefore allow chat by existing room members.
    throttle?: number //(optional) Defaults to 0. This is the number of seconds to delay new incomming messags so that the chat room doesn't scroll messages too fast.
}

export interface RoomOptional {
    roomid?: string
}
export interface Expires {
    expireseconds?: number
}

export interface ShadowBanOptions extends Expires, RoomOptional {
    shadowban: boolean,
}

export interface MuteOptions extends Expires, RoomOptional{
    mute: boolean,
}

export interface UserEffect {
    type: string,
    expires: string,
    userid: string
}

export interface RoomUserEffect {
    user: UserResult,
    effect: UserEffect
}


export interface ChatRoomEffectsList {
    kind: Kind.roomusereffects
    itemcount: number,
    effects: RoomUserEffect[]
}

/**
 * The Model describing the API result of a created room. The key difference is that RoomResult objects will always have an ID, whereas Room objects do not have this guarantee.
 */
export interface ChatRoomResult extends ChatRoom {
    id: string,
    kind?: Kind.room,  //"chat.room"
    ownerid?:string,
    appid?: string,
    bouncedusers?: string[], // will be a list of UserID strings.
    inroom?:number,
    shadowbannedusers?: string[]
    flaggedusers?: [],
    reportedusers?: [],
    added?: string, // ISO Date
    whenmodified?:string // ISO Date
}

/**
 * The response for any room listing queries.
 */
export interface ChatRoomListResponse extends ListResponse {
    kind: Kind.roomlist,
    rooms: Array<ChatRoomResult>,
}

/**
 * The response for any event listing queries.
 */
export interface EventListResponse extends ListResponse {
    kind: Kind.eventlist,
    events: Array<EventResult>
}


export enum EventModerationState {
    na = "na",
    approved = "approved",
    rejected = "rejected"
}
export interface Event {
    roomid: string, // The ID of the room to which the event was sent.
    added?: string, // ISO 8601 timestamp
    ts: number, // a millisecond level timestamp. Used for evaluating relative times between events. Do not rely on this as a true time value, use added.
    body: string, // Chat text
    active?: boolean,
    moderation?: EventModerationState,
    eventtype: EventType, // speech, purge, etc. Can hold custom types beyond those in the enum. The enum contains only system types.
    userid: string // the ID of the user who created the event.
    user: UserResult // the User object who created the event
    customtype?:string, // a custom type set for the event, or empty string
    customid?:string, // a custom id for the event, or empty string.
    custompayload?:object, // a custom payload added to the event, may be stringified JSON
    replyto?: EventResult | object, // the ID of the event that this event is a reply to
    reactions?:Array<EventReaction> // the reactions that have happened to this event.
    shadowban: boolean
    mutedby: []
    reports?: Array<ReportReason>
}

/**
 * An EventResult is created whenever a chat event is accepted by a server, and represents the event model returned by the API.
 */
export interface EventResult extends Event {
    kind: Kind.chat, // Sent as part of API validation.  Generally no relevance for clients
    id: string, // The ID of a chat event. Generated by server
    censored: boolean,
    originalbody?: string,
    editedbymoderator: boolean
    whenmodified: string,
}

export interface EventReaction {
    type: Reaction | string,
    count: number,
    users: UserResult[]
}

export interface ChatEventsList {
    events: EventResult[]
    cursor?: string
    more?: boolean
    itemcount?: number
}

export interface ChatEventsListResult extends ChatEventsList {
    kind: Kind.chatlist,
    cursor: string
    more: boolean
    itemcount: number
}

export interface TimestampRequest {
    ts: string | number,
    limitolder?: number,
    limitnewer?: number
}

/**
 * Result of getting chat updates.
 */
export interface ChatUpdatesResult extends ChatEventsListResult {
    room: ChatRoomResult,
}

/**
 * EventResult will have eventtype === 'bounce'
 */
export interface BounceUserResult {
    kind: Kind.bounce,
    event: EventResult,
    room: ChatRoomResult
}

export interface EventSearchParams {
    fromuserid?: string,
    fromhandle?: string,
    roomid?: string
    body?: string
    direction?: 'forward' | 'backward',
    types?: EventType[],
    cursor?: string,
    limit?: number
}

export interface RoomEffectData {
    userid: string,
    expireseconds?: number
}

export interface ShadowbanUserApiData extends RoomEffectData {
    shadowban: boolean,
}

export interface MuteUserApiData extends RoomEffectData {
    mute: boolean
}

