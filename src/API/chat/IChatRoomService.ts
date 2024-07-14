import {ISportsTalkConfigurable} from "../Configuration";
import {
    BounceUserResult,
    EventResult
} from "../../models/ChatModels";
import {RestApiResult} from "../../models/CommonModels";
import {
    ChatRoom, ChatRoomExitResult,
    ChatRoomExtendedDetailsRequest,
    ChatRoomExtendedDetailsResponse,
    ChatRoomListResponse, ChatRoomResult, DeletedChatRoomResponse, JoinChatRoomResponse, JoinOptions
} from "../../models/chat/ChatRoom";
import {User, UserResult} from "../../models/user/User";
import {ReportType} from "../../models/Moderation";

/**
 * Interface for room management
 * @interface
 */
export interface IChatRoomService extends ISportsTalkConfigurable {
    /**
     * Lists available rooms for an app
     */
    listRooms(cursor?: string, limit?: number): Promise<ChatRoomListResponse>

    /**
     * Gets room details
     * @param room a ChatRoomResult or a string which represents roomID.
     * @returns the ChatRoomResult or null, if no room found.
     */
    getRoomDetails(room: ChatRoomResult | string): Promise<ChatRoomResult | null>

    /**
     * Resets a chat room's data.
     * @param room
     */
    resetChatRoom(room: ChatRoomResult | string): Promise<ChatRoomResult>

    /**
     * Gets room details
     * @param room a ChatRoomResult or a string which represents customid.
     * @returns the ChatRoomResult or null, if no room found.  If there is no customid set on the ChatRoomResult object, this will return null.
     */
    getRoomDetailsByCustomId(room: ChatRoomResult | string): Promise<ChatRoomResult | null>

    /**
     * @param request object with properties `roomids`
     *
     */
    getRoomExtendedDetails(request: ChatRoomExtendedDetailsRequest): Promise<ChatRoomExtendedDetailsResponse>

    /**
     *
     * @param id
     */
    deleteRoom(id: string | ChatRoom): Promise<DeletedChatRoomResponse>

    /**
     * Creates a room.  Will throw an error on failure.
     * @param room the ChatRoomResult representing the object on the server
     */
    createRoom(room: ChatRoom): Promise<ChatRoomResult>

    /**
     * Returns a specific event for the room
     * @param id
     * @param roomid OPTIONAL.  The room id for the room holding the event. Defaults to the current room. If no value passed and no room set, the method will throw an error.
     */
    getEventById(id: string, roomid?: string): Promise<EventResult>

    /**
     * Will update the room with new values.
     * @param room
     */
    updateRoom(room: ChatRoomResult): Promise<ChatRoomResult>

    /**
     * Will set a room to be in the "closed" state.
     * @param room
     */
    closeRoom(room: ChatRoomResult | string): Promise<ChatRoomResult>

    /**
     * Will set a room to be in the "open" state.
     * @param room
     */
    openRoom(room: ChatRoomResult | string): Promise<ChatRoomResult>

    /**
     * Will remove a user from a room and prevent them from returning
     * @param room the room
     * @param user the user to bounce from the room
     * @param message A message giving an explanation.
     */
    bounceUserFromRoom(room: ChatRoomResult | string, user: UserResult | string, message?: string): Promise<RestApiResult<BounceUserResult>>

    purgeUserMessagesFromRoom(room: ChatRoomResult | string, user: User | string): Promise<RestApiResult<any>>

    unbounceUserFromRoom(room: ChatRoomResult | string, user: UserResult | string, message?: string): Promise<RestApiResult<BounceUserResult>>

    listParticipants(room: ChatRoom, cursor?: string, maxresults?: number): Promise<Array<UserResult>>

    listUserMessages(user: User | string, Room: ChatRoom | String, cursor?: string, limit?: number): Promise<Array<EventResult>>

    joinRoom(room: ChatRoom | string, user: User, options?: JoinOptions): Promise<JoinChatRoomResponse>

    joinRoomByCustomId(room: ChatRoom | string, user: User, options?: JoinOptions): Promise<JoinChatRoomResponse>

    exitRoom(user: User | string, room: ChatRoom | string): Promise<ChatRoomExitResult>

    setRoomShadowbanStatus(user: User | string, room: ChatRoomResult | string, shadowban: boolean, expiresSeconds?: number): Promise<ChatRoomResult>

    setRoomMuteStatus(user: User | string, room: ChatRoomResult | string, mute: boolean, expiresSeconds?: number): Promise<ChatRoomResult>

    reportUser(reported: User | string, reportedBy: User | string, reportType?: ReportType, room?: ChatRoomResult | string): Promise<ChatRoomResult>
}