import { Kind, ListRequest, ListResponse } from "../CommonModels";
export declare const UserModerationState: {
    readonly Flagged: "flagged";
    readonly Approved: "approved";
    readonly Rejected: "rejected";
};
export declare enum UserRole {
    admin = "admin",
    moderator = "moderator",
    user = "user"
}
/**
 * A User is someone able to chat in chatrooms and make comments in conversations.
 * Users must be created before they can make comments or chat, and they must choice a chat room before they can participate.
 */
export interface User {
    userid: string;
    handle?: string;
    handlelowercase?: string;
    displayname?: string;
    pictureurl?: string;
    profileurl?: string;
    banned?: boolean;
    shadowbanned?: boolean;
    role?: UserRole;
    customtags?: string[];
    shadowbanexpires?: string | null | undefined;
}
export interface UserResult extends User {
    kind?: Kind.user;
    reports: [];
    muted: boolean;
    flagged: boolean;
    muteexpires: string;
    banned: boolean;
    banexpires?: string;
    shadowbanned: boolean;
    shadowbanexpires?: string;
}
/**
 * Used only for searching users by API.  A sear
 */
export declare enum UserSearchType {
    handle = "handle",
    name = "name",
    userid = "userid"
}
export interface UserListResponse extends ListResponse {
    kind: Kind.userlist;
    users: UserResult[];
}
export interface UserDeletionResponse {
    user: UserResult;
    kind: Kind.deleteduser;
}
export interface UserModerationListRequest extends ListRequest {
    filterHandle?: string;
    filterUserId?: string;
    filterChatRoomId?: string;
    filterChatRoomCustomId: string;
    filterModerationState?: typeof UserModerationState;
}
