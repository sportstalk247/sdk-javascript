import {Kind, ListRequest, ListResponse} from "../CommonModels";

export const UserModerationState = {
    Flagged: 'flagged',
    Approved: 'approved',
    Rejected: 'rejected'
} as const;

export enum UserRole {
    admin = "admin",
    moderator = "moderator",
    user = "user"
}

/**
 * A User is someone able to chat in chatrooms and make comments in conversations.
 * Users must be created before they can make comments or chat, and they must choice a chat room before they can participate.
 */
export interface User {
    userid: string, // Unique ID, defined by client application to use native IDs.
    handle?: string, // Allowed Characters:  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_"
    handlelowercase?: string, // an all lowercase version of the handle
    displayname?: string, // A friendly display name.  E.g. a user has a handle "jjsmithyperson" and their display name "John J. Smith"
    pictureurl?: string, // a full URL to a profile photo.
    profileurl?: string, // a full URL to a profile url or personal webpage.
    banned?: boolean, // Only set by the server.  If true the user is currently banned.
    shadowbanned?: boolean // Set by server when admin mutes/shadowbans a user.
    role?: UserRole,
    customtags?: string[],
    shadowbanexpires?: string | null | undefined // Set by server to non-null value when the shadowban expires. Expiry date/time in ISO8601, e.g. 2020-11-11T14:29:04.5149528Z
}

export interface UserResult extends User {
    kind?: Kind.user
    reports: []
    muted: boolean,
    flagged: boolean,
    muteexpires: string,
    banned: boolean
    banexpires?: string,
    shadowbanned: boolean
    shadowbanexpires?: string
}

/**
 * Used only for searching users by API.  A sear
 */
export enum UserSearchType {
    handle = 'handle',
    name = 'name',
    userid = 'userid'
}

export interface UserListResponse extends ListResponse {
    kind: Kind.userlist
    users: UserResult[]
}

export interface UserDeletionResponse {
    user: UserResult,
    kind: Kind.deleteduser
}

export interface UserModerationListRequest extends ListRequest {
    filterHandle?: string,
    filterUserId?: string,
    filterChatRoomId?: string,
    filterChatRoomCustomId: string,
    filterModerationState?: typeof UserModerationState
}