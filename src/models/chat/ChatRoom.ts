import {Kind, ListResponse} from "../CommonModels";
import {ChatUpdatesResult, UserEffect, UserReport} from "../ChatModels";
import {User, UserResult} from "../user/User";
import {ModerationType} from "../Moderation";

export interface JoinChatRoomResponse {
    user: UserResult,
    room: ChatRoomResult
    eventscursor: ChatUpdatesResult
    previouseventscursor?: string
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
    name: string, //The name of the room
    description?: string, // optional room description
    moderation?: ModerationType, // 'pre' or 'post'
    slug?: string,// The room slug, migrated to customid
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
    ownerid?: string,
    appid?: string,
    bouncedusers?: string[], // will be a list of UserID strings.
    inroom?: number,
    shadowbannedusers?: string[]
    flaggedusers?: [],
    reportedusers?: UserReport[],
    added?: string, // ISO Date
    whenmodified?: string // ISO Date
}

/**
 * The response for any room listing queries.
 */
export interface ChatRoomListResponse extends ListResponse {
    kind: Kind.roomlist,
    rooms: Array<ChatRoomResult>,
}

export interface UserChatroomSubscription {
    kind: Kind.chatsubscription,
    id: string,
    roomid: string,
    roomcustomid?: string,
    userid: string,
    updated: string, // ISO 8601
    added: string, // ISO 8601
}
export interface UserSubscriptionListResponse extends ListResponse {
    kind: Kind.userroomsubscriptions,
    subscriptions: Array<UserChatroomSubscription>,
}



export interface RoomEffectData {
    userid: string,
    expireseconds?: number
    applyeffect: boolean
}

export enum ChatRoomEntityNames {
    room = 'room',
    numparticipants = 'numparticipants',
    lastmessagetime = 'lastmessagetime'
}

export interface ChatRoomExtendedDetailsRequest {
    roomids?: string[],
    customids?: string[],
    entities?: ChatRoomEntityNames[],
}

export interface ChatRoomExtendedDetails {
    room: ChatRoomResult,
    mostrecentmessagetime?: string, // ISO 8601 date
    inroom?: number
}

export interface ChatRoomExtendedDetailsResponse {
    details: ChatRoomExtendedDetails[]
}