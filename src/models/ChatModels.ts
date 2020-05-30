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

export enum EventType {
    speech = "speech",
    purge = "purge",
    reaction = "reaction",
    roomClosed = "roomclosed",
    roomOpen = "roomopen",
    action = "action",
    reply = "reply",
    quote = "quote",
    goal = "goal", // custom type
    advertisement = "advertisement" // custom type
}

export interface JoinChatRoomResponse {
    user: UserResult,
    room: ChatRoomResult
    eventscursor: ChatUpdatesResult
}

/**
 * Also an optional member of the constructor.
 * Takes a full set of the possible event handlers.
 * Each handler can also be set individually.
 */
export interface EventHandlerConfig {
    onChatStart?: Function;
    onNetworkResponse?(response: RestApiResult<any>);
    onChatEvent?(event: EventResult), // not mandatory but absolutely should be set in 99% of cases.
    onGoalEvent?(event: EventResult),
    onAdEvent?(event: EventResult),
    onReply?(event: EventResult),
    onReaction?(event:EventResult),
    onPurgeEvent?(event:EventResult),
    onAdminCommand?(response: RestApiResult<Kind.api>),
    onHelp?(result: MessageResult<Event | CommandResponse | null>),
    onNetworkError?(error: Error)
    onRoomChange?(oldRoom?:ChatRoom, newRoom?:ChatRoom)
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

/**
 * Chat commands.
 */
export interface CommandOptions {
    customtype?: string,
    customid?: string,
    replyto?: string,
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
    customid?: string,
    enableprofanityfilter?: boolean, //Defaults to true, events in room will have profanity filtered (in English).
    delaymessageseconds?: number, // Delays messages, used for throttling. Defaults to zero and most of the time that's what you will want.
    enableactions?: boolean, // Whether or not users can utilize action commands.
    roomisopen?: boolean, // allows chat
    maxreports?: number, // defaults to 3. The number of flags it takes to add a comment to the moderation queue.
    enableenterAndexit?: boolean, // Whether the room allows people to enter.  This is different than being open.  A room that denies entry can still be open and therefore allow chat by existing room members.
    throttle?: number //(optional) Defaults to 0. This is the number of seconds to delay new incomming messags so that the chat room doesn't scroll messages too fast.
}

/**
 * The Model describing the API result of a created room. The key difference is that RoomResult objects will always have an ID, whereas Room objects do not have this guarantee.
 */
export interface ChatRoomResult extends ChatRoom {
    id: string,
    kind?: Kind.room,  //"chat.room"
    ownerid?:string,
    inroom?:number,
    whenmodified?:string
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
    na = "na"
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

export interface Event {
    roomid: string, // The ID of the room to which the event was sent.
    added: number, // Unix timestamp for when event was added.
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

export interface EventReaction {
    type: Reaction | string,
    count: number,
    users: UserResult[]
}

/**
 * Result of getting chat updates.
 */
export interface ChatUpdatesResult {
    kind: Kind.chatlist,
    cursor: string
    more: boolean
    itemcount: number
    room: ChatRoomResult,
    events: EventResult[]
}
