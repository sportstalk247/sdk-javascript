import { EventResult, EventListResponse, BounceUserResult } from "../../../models/ChatModels";
import { RestApiResult, SportsTalkConfig } from "../../../models/CommonModels";
import { IChatRoomService } from "../../../API/chat/IChatRoomService";
import { ChatRoom, ChatRoomExitResult, ChatRoomExtendedDetailsRequest, ChatRoomExtendedDetailsResponse, ChatRoomListResponse, ChatRoomResult, DeletedChatRoomResponse, JoinChatRoomResponse } from "../../../models/chat/ChatRoom";
import { User, UserResult } from "../../../models/user/User";
import { ReportType } from "../../../models/Moderation";
/**
 * This room uses REST to manage sportstalk chat rooms.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
export declare class RestfulChatRoomService implements IChatRoomService {
    private _config;
    private _apiHeaders;
    private _jsonHeaders;
    private _apiExt;
    constructor(config: SportsTalkConfig);
    /**
     * Set config
     * @param config
     */
    setConfig: (config: SportsTalkConfig) => void;
    /**
     * RoomResult Handling
     */
    listRooms: (cursor?: string | undefined, limit?: number | undefined) => Promise<ChatRoomListResponse>;
    /**
     * Delete a room.
     * @param room
     */
    deleteRoom: (room: ChatRoom | string) => Promise<DeletedChatRoomResponse>;
    /**
     * Create a new room
     * @param room
     */
    createRoom: (room: ChatRoom) => Promise<ChatRoomResult>;
    /**
     *
     * @param {User | string} user - the userobject with userid or just the userid string
     * @param {ChatRoom | string} room - the ChatRoom object with id or just the chatroom roomid.
     * @param {string} cursor - cursor, optional
     * @param {number} limit - result limit, optiona.  Default 100.
     */
    listUserMessages: (user: User | string, room: ChatRoom | string, cursor?: string, limit?: number) => Promise<EventListResponse>;
    listParticipants: (room: ChatRoom, cursor?: string | undefined, maxresults?: number) => Promise<Array<UserResult>>;
    /**
     * Join a room
     * @param {string | User} user
     * @param {ChatRoomResult | string} room
     */
    joinRoom: (room: ChatRoomResult | string, user: User) => Promise<JoinChatRoomResponse>;
    /**
     * Join a room
     * @param user
     * @param room
     */
    joinRoomByCustomId(room: ChatRoom | string, user?: User): Promise<JoinChatRoomResponse>;
    /**
     * Returns a specific event for the room
     * @param id
     * @param roomid OPTIONAL.  The room id for the room holding the event. Defaults to the current room. If no value passed and no room set, the method will throw an error.
     */
    getEventById: (eventid: string, roomid: string) => Promise<EventResult>;
    /**
     * Removes a user from a room.
     * @param user The user to exit from the room, or their ID.
     * @param room The chatroom to exit or it's ID.
     */
    exitRoom: (user: User | string, room: ChatRoom | string) => Promise<ChatRoomExitResult>;
    /**
     * Sets a room to be closed.
     * @param room The room to open
     */
    closeRoom: (room: ChatRoomResult | string) => Promise<ChatRoomResult>;
    /**
     * Sets a room to be open.
     * @param room The room to open
     */
    openRoom: (room: ChatRoomResult | string) => Promise<ChatRoomResult>;
    /**
     * Will update room settings
     * @param room A ChatRoomResult.  The room must already exist.  All settings sent will be overridden.
     */
    updateRoom: (room: ChatRoomResult) => Promise<ChatRoomResult>;
    /**
     * Will retrieve room details
     * @param room A ChatRoomResult object or a room id.
     */
    getRoomDetails: (room: ChatRoomResult | string) => Promise<ChatRoomResult | null>;
    /**
     * Will retrieve the room details.
     * @param room a customid for a room, or a ChatRoomResult with a customID set.
     */
    getRoomDetailsByCustomId: (room: ChatRoomResult | string) => Promise<ChatRoomResult | null>;
    /**
     * Will remove all of a user's messages from a room and send a purge event to clients.
     * @param room the ChatRoomResult or a room ID.
     * @param user the User or a userid string.
     */
    purgeUserMessagesFromRoom: (room: ChatRoomResult | string, user: User | string) => Promise<RestApiResult<BounceUserResult>>;
    /**
     * Removes a user from a room and prevents them from returning. Will add them to the 'bounced users' list on the room.
     * @param room ChatRoomResult or ChatRoom ID
     * @param user User or userid string.
     * @param message The message to show the user explaining the bounce/unbounce.
     */
    bounceUserFromRoom: (room: ChatRoomResult | string, user: User | string, message?: string | undefined) => Promise<RestApiResult<BounceUserResult>>;
    /**
     * Removes a user from the room's bounce list
     * @param {string | ChatRoomResult} room ChatRoomResult or ChatRoom ID
     * @param {string | User} user User or userid string.
     * @param {string} message The message to show the user explaining the bounce/unbounce.
     */
    unbounceUserFromRoom: (room: ChatRoomResult | string, user: User | string, message?: string | undefined) => Promise<RestApiResult<BounceUserResult>>;
    /**
     * Gets the extended details of a room
     * @param {ChatRoomExtendedDetailsRequest} request ChatRoomExtendedDetailsRequest properties roomids, customids, entities
     * @return {ChatRoomExtendedDetailsResponse}
     */
    getRoomExtendedDetails: (request: ChatRoomExtendedDetailsRequest) => Promise<ChatRoomExtendedDetailsResponse>;
    setRoomShadowbanStatus: (user: User | string, room: ChatRoomResult | string, shadowban: boolean, expiresSeconds?: number | undefined) => Promise<ChatRoomResult>;
    setRoomMuteStatus: (user: User | string, room: ChatRoomResult | string, mute: boolean, expiresSeconds?: number | undefined) => Promise<ChatRoomResult>;
    reportUser: (reported: User | string, reportedBy: User | string, reportType?: ReportType, room?: string | ChatRoomResult | undefined) => Promise<ChatRoomResult>;
}
