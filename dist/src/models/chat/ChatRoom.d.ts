import { Kind, ListResponse } from "../CommonModels";
import { ChatUpdatesResult, UserEffect, UserReport } from "../ChatModels";
import { User, UserResult } from "../user/User";
import { ModerationType } from "../Moderation";
export interface JoinChatRoomResponse {
    user: UserResult;
    room: ChatRoomResult;
    eventscursor: ChatUpdatesResult;
    previouseventscursor?: string;
}
export interface JoinRoomResponse {
    room: ChatRoom;
    user: User;
}
export interface DeletedChatRoomResponse {
    kind: Kind.deletedroom;
    deletedEventsCount: number;
    room: ChatRoom;
}
/**
 * The response messsages for a RoomExit action.
 */
export declare enum ChatRoomExitResult {
    success = "Success"
}
/**
 * API Result Objects
 */
/**
 * Describes a chat room.
 */
export interface ChatRoom {
    id?: string;
    name: string;
    description?: string;
    moderation?: ModerationType;
    slug?: string;
    customid?: string;
    customtags?: string[];
    pictureurl?: string;
    enableprofanityfilter?: boolean;
    delaymessageseconds?: number;
    enableactions?: boolean;
    roomisopen?: boolean;
    maxreports?: number;
    enableenterandexit?: boolean;
    throttle?: number;
}
export interface RoomOptional {
    roomid?: string;
}
export interface RoomUserEffect {
    user: UserResult;
    effect: UserEffect;
}
export interface ChatRoomEffectsList {
    kind: Kind.roomusereffects;
    itemcount: number;
    effects: RoomUserEffect[];
}
/**
 * The Model describing the API result of a created room. The key difference is that RoomResult objects will always have an ID, whereas Room objects do not have this guarantee.
 */
export interface ChatRoomResult extends ChatRoom {
    id: string;
    kind?: Kind.room;
    ownerid?: string;
    appid?: string;
    bouncedusers?: string[];
    inroom?: number;
    shadowbannedusers?: string[];
    flaggedusers?: [];
    reportedusers?: UserReport[];
    added?: string;
    whenmodified?: string;
}
/**
 * The response for any room listing queries.
 */
export interface ChatRoomListResponse extends ListResponse {
    kind: Kind.roomlist;
    rooms: Array<ChatRoomResult>;
}
export interface UserChatroomSubscription {
    kind: Kind.chatsubscription;
    id: string;
    roomid: string;
    roomcustomid?: string;
    userid: string;
    updated: string;
    added: string;
}
export interface UserSubscriptionListResponse extends ListResponse {
    kind: Kind.userroomsubscriptions;
    subscriptions: Array<UserChatroomSubscription>;
}
export interface RoomEffectData {
    userid: string;
    expireseconds?: number;
    applyeffect: boolean;
}
export declare enum ChatRoomEntityNames {
    room = "room",
    numparticipants = "numparticipants",
    lastmessagetime = "lastmessagetime"
}
export interface ChatRoomExtendedDetailsRequest {
    roomids?: string[];
    customids?: string[];
    entities?: ChatRoomEntityNames[];
}
export interface ChatRoomExtendedDetails {
    room: ChatRoomResult;
    mostrecentmessagetime?: string;
    inroom?: number;
}
export interface ChatRoomExtendedDetailsResponse {
    details: ChatRoomExtendedDetails[];
}
