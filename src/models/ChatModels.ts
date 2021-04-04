/**
 * Models used by Chat API and API Responses
 */
import {Kind, ListResponse, MessageResult, Reaction, RestApiResult} from "./CommonModels";
import {ErrorHandlerFunction} from "../impl/network";
import {ChatRoom, ChatRoomResult, RoomEffectData, RoomOptional} from "./chat/ChatRoom";
import {UserResult} from "./user/User";
import {ReportReason} from "./Moderation";

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

export interface Expires {
    expireseconds?: number
}

export interface EffectOptions extends Expires, RoomOptional {
    applyeffect: boolean,
}

export interface MuteOptions extends EffectOptions {
    userid: string,
    mute: boolean,
}

export interface UserEffect {
    effecttype: 'flag' | 'mute' | 'shadowban',
    expires: string,
    userid: string
}


export interface UserReport {
    userid: string
    reportedbyuserid: string
    reason: ReportReason
    added: string
}

export interface UserEffectFlags {
    mute: boolean,
    shadowban: boolean,
    flag: boolean
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

export interface ShadowbanUserApiData extends RoomEffectData {
    shadowban?: boolean,
    applyeffect: boolean,
}

export interface MuteUserApiData extends RoomEffectData {
    applyeffect: boolean
    mute?: boolean
}

