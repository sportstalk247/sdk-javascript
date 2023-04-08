import {ISportsTalkConfigurable,IUserConfigurable} from "../Configuration";
import {
    AdvertisementOptions,
    BounceUserResult,
    ChatEventsList,
    ChatUpdatesResult,
    CommandOptions,
    CommandResponse,
    EffectOptions,
    EventHandlerConfig,
    EventResult,
    EventType,
    GoalOptions,
    TimestampRequest
} from "../../models/ChatModels";
import {
    ErrorResult,
    ListRequest,
    MessageResult,
    Reaction,
    RestApiResult
} from "../../models/CommonModels";
import {
    ChatRoom,
    ChatRoomExtendedDetailsRequest,
    ChatRoomExtendedDetailsResponse,
    ChatRoomListResponse, ChatRoomResult, JoinChatRoomResponse, JoinOptions, UserSubscriptionListResponse
} from "../../models/chat/ChatRoom";
import {User, UserDeletionResponse, UserListResponse, UserResult, UserSearchType} from "../../models/user/User";
import {Notification} from "../../models/user/Notifications";
import {ReportType} from "../../models/Moderation";

/**
 * Interface for ChatClient.
 *
 * For most user-facing chat implementations, this is the only class you need.
 * @interface
 */
export interface IChatClient extends IUserConfigurable, ISportsTalkConfigurable {

    /**
     * Send a chat command.  Usually only the first param is needed.
     * @param command the chat string, which can also include admin or action commands by starting with `/` or `*`
     * @param options the custom parameters.  See CommandOptions interface for details.
     * @return MessageResult returns the server response.
     */
    executeChatCommand(command: string, options?: CommandOptions): Promise<MessageResult<null | CommandResponse>>

    /**
     * Reply to an event
     * @param message the text that will make up the reply
     * @param replyto the Event that is being replied to or the event ID as a string
     * @param options custom options, will depend on your chat implementation
     */
    sendQuotedReply(message: string, replyto: string, options?: CommandOptions): Promise<MessageResult<null | EventResult>>

    /**
     * Reply to an event
     * @param message the text that will make up the reply
     * @param replyto the Event that is being replied to or the event ID as a string
     * @param options custom options, will depend on your chat implementation
     */
    sendThreadedReply(message: string, replyto: string, options?: CommandOptions): Promise<MessageResult<null | EventResult>>

    /**
     * Sends an announcement, forces the announcement eventType.  Convenience method around executeChatCommand.
     * @param command
     * @param options
     */
    sendAnnouncement(command: string, options?: CommandOptions): Promise<MessageResult<CommandResponse> | ErrorResult>;

    /**
     * React to an event
     * @param reaction the type of reaction, right now just 'like'
     * @param reactToMessage the message to react to, either the event itself or its ID.
     * @param options additional command options, typically ignored.
     * @return MessageResult
     */
    reactToEvent(reaction: Reaction, reactToMessage: EventResult | string, options?: CommandOptions): Promise<MessageResult<null | CommandResponse>>

    /**
     * Checks if a user is bounced from a room.  If forceRefresh is true, will always ask the server for fresh data.
     * Will also check the server if the current room is just an ID and not a full ChatRoomResult object.
     * @param user
     * @param room optional room, will use current room if not set.
     * @param forceRefresh will force a server update of the room before checking status.
     */
    isUserBouncedFromRoom(user: User | string, forceRefresh?: boolean, room?: ChatRoomResult | string): Promise<boolean>

    /**
     * Checks if a user is shadowbanned from a room.  If forceRefresh is true, will always ask the server for fresh data.
     * Will also check the server if the current room is just an ID and not a full ChatRoomResult object.
     * @param user
     * @param room optional room, will use current room if not set.
     * @param forceRefresh will force a server update of the room before checking status.
     */
    isUserShadowbanned(user: User | string, forceRefresh?: boolean, room?: ChatRoomResult | string): Promise<boolean>


    /**
     * Send an advertisement custom event
     * @param options
     */
    sendAdvertisement(options: AdvertisementOptions): Promise<MessageResult<null | CommandResponse>>

    /**
     * Send a goal custom event.
     * This is a convenience wrapper around custom messagings, if a default image is set, no further parameters are needed.
     *
     * @param message The message to be sent with the goal.  Defaults to GOAL!!!
     * @param img The full url of the image to send as part of the goal, e.g. https://....
     * @param options other custom options to send.
     */
    sendGoal(message?: string, img?: string, options?: GoalOptions): Promise<MessageResult<null | CommandResponse>>

    /**
     * Convenience API for sending goals. This sets a default image so that users don't need to provide one
     * each time a goal event happens.
     * @param url should be a complete URL, including http://
     */
    setDefaultGoalImage(url: string);

    /**
     * Report a chat event for violating community policy.
     * @param event
     * @param type
     */
    reportMessage(event: EventResult | string, reason: ReportType): Promise<MessageResult<null>>,

    /**
     * List rooms. Allows you to cursor through longer lists.
     * @param cursor
     * @param limit
     */
    listRooms(cursor?: string, limit?: number): Promise<ChatRoomListResponse>

    /**
     * Lists the rooms that a user has joined.
     * @param user the User object or the userid
     * @param cursor used to cursor through longer lists.
     */
    listUserSubscribedRooms(user: User | string, cursor?: string): Promise<UserSubscriptionListResponse>
    /**
     * Create a new chatroom
     * @param room the Room object describing the room
     * @return the Room created on the server, with a roomID.
     */
    createRoom(room): Promise<ChatRoomResult>;

    /**
     * Update a room that's been created.
     * @param room An already created room with a roomId.
     * @return the updated room information.
     */
    updateRoom(room: ChatRoomResult): Promise<ChatRoomResult>

    /**
     * Join a chat room
     * @param room or room ID
     * @return Promise the JoinChatRoomResponse from the server.
     */
    joinRoom(room: ChatRoomResult | string, joinOptions: JoinOptions): Promise<JoinChatRoomResponse>;

    /**
     * Join a chat room
     * @param room or room customID
     * @return Promise the JoinChatRoomResponse from the server.
     */
    joinRoomByCustomId(room: ChatRoom | string, joinOptions: JoinOptions): Promise<JoinChatRoomResponse>;

    /**
     * Gets the current Chatroom.
     * @return ChatRoom
     */
    getCurrentRoom(): ChatRoom | null;

    /**
     * Sets the current room. The room must have an ID and have already been created on the server.
     * @param room
     */
    setCurrentRoom(room: ChatRoomResult);

    /**
     * List participants in the chatroom.
     * @param cursor
     * @param maxresults
     */
    listParticipants(cursor?: string, maxresults?: number): Promise<Array<User>>;

    /**
     * Sets the event handling objects
     * @param eventHandlers
     */
    setEventHandlers(eventHandlers: EventHandlerConfig);

    /**
     * Gets the current handler functions. Often used for debugging.
     * @return EventHandlerConfig
     */
    getEventHandlers(): EventHandlerConfig;

    /**
     * Removes all user messages from a room.
     * @param user Optional.  A user whose messages to purge from room.
     * @param room Optional.  The room to purge messages from. Defaults to current room, if set.  Otherwise throws an error.
     */
    purgeUserMessagesFromRoom(user?: UserResult | string, room?: ChatRoomResult | string): Promise<RestApiResult<null>>

    /**
     * If the user exists, updates the user. Otherwise creates a new user.
     * @param user a User model.  The values of 'banned', 'handlelowercase' and 'kind' are ignored.
     * @return Promise<User> will return a UserResult object from the creation of a user or the update of a user with the same ID.
     */
    createOrUpdateUser(user: User, setDefault?: boolean): Promise<User>

    /**
     * Polls the server.
     * SIDE EFFECTS: Will call the event handler functions depending on the results.
     */
    getUpdates(): Promise<ChatUpdatesResult>,

    /**
     * Starts polling the server for updates.
     * SIDE EFFECTS: will repeatedly trigger the event handler functions.  Will not stop until stopListeningToEventUpdates() is called.
     */
    startListeningToEventUpdates();

    /**
     * Stops server polling.
     */
    stopListeningToEventUpdates();

    /**
     * Will look backwards
     * @param cursor
     * @param limit
     */
    listPreviousEvents(cursor?: string, limit?: number): Promise<ChatUpdatesResult>

    /**
     * Flags an event as deleted
     * @param event the event to be deleted.
     * @return the result of the API call.
     */
    flagEventLogicallyDeleted(event: EventResult | string): Promise<MessageResult<null>>

    /**
     * Permanently deletes an event.
     * @param event the event to be deleted.
     * @return the result of the API call.
     */
    permanetlyDeleteEvent(event: EventResult | string): Promise<MessageResult<null>>

    setBanStatus(user: User | string, isBanned: boolean): Promise<UserResult>

    /**
     * Sets shadowban status for a user.
     * @param user
     * @param options
     */
    setShadowBanStatus(user: User | string, options: EffectOptions): Promise<UserResult | ChatRoomResult>

    /**
     * creates a new user, or updates a user if that userid already exists.
     * Do not use blindly.
     * @param user
     */
    createOrUpdateUser(user: User): Promise<UserResult>

    /**
     * Finds a user
     * @param search
     * @param type
     * @param limit
     */
    searchUsers(search: string, type: UserSearchType, limit?: number): Promise<UserListResponse>

    /**
     * Lists users.
     * @param request a ListRequest, containing cursor and limit properties.
     */
    listUsers(request?: ListRequest): Promise<UserListResponse>

    /**
     * Deletes a user. Cannot be reversed.
     * @param user a User object with an id or a userid string
     */
    deleteUser(user: User | string): Promise<UserDeletionResponse>

    /**
     * Gets a fresh copy of a user from the server.
     * @param user
     */
    getUserDetails(user: User | string): Promise<UserResult>

    /**
     * Reports a user globally.
     * @param userToReport
     * @param reportedBy
     * @param reportType
     */
    reportUser(userToReport: User | string, reportedBy: User | string, reportType?: ReportType): Promise<User>

    /**
     * Checks if the current user has already reported a message.
     * If no current user set or provided, throws an error;
     * @param event the event to check.  Will evaluate if the given user or default user has reported it.
     * @param user optional. A user to check for reporting.
     * @return boolean true if reported by the given user.
     */
    messageIsReported(event: EventResult, user?: User): Boolean

    /**
     * Bounces a user from a room, removing from room and banning them.
     *
     * @param user a UserResult (with id) or a string representing the userid
     * @param message the bounce reason.
     * @return BounceUserResult the result of the command from the server.
     */
    bounceUser(user: User | string, message: string): Promise<BounceUserResult>

    /**
     * Removes a user from the bounce list if they were bounced before. Allows them to rejoin chat.
     *
     * @param user a UserResult (with id) or a string representing the userid
     * @param message the bounce reason.
     * @return BounceUserResult the result of the command from the server.
     */
    unbounceUser(user: User | string, message: string): Promise<BounceUserResult>

    /**
     * Checks if a message was reacted to by the current user.
     * @param event The event to evaluate.
     * @param reaction true or false.  Returns false if no user set.
     * @return boolean true if the message was reacted to by the current user. If no user set, always false.
     */
    messageIsReactedTo(event: EventResult, reaction: Reaction | string): Boolean

    /**
     * Manually set the cursor used to grab new updates.
     * You may want to use this and setPreviousEventsCursor if you are scrolling through a large number of messages
     * and wish to limit the number of events somehow to improve UI responsiveness.
     * @param cursor
     */
    setUpdatesCursor(cursor: string)

    /**
     * Manually set the cursor holding the oldest event known, for scrollback.
     * You may need to use this if you scroll back a lot
     * @param cursor
     */
    setPreviousEventsCursor(cursor: string)


    updateChatEvent(event: EventResult | string, body: string, user?: string | User): Promise<EventResult>

    listEventsByType(type: EventType): Promise<ChatEventsList>

    listEventsByTimestamp(query: TimestampRequest): Promise<ChatEventsList>

    setNotificationReadStatus(notificationid: string, read?: boolean, userid?: string): Promise<Notification>

    setNotificationReadStatusByChatEventId(chateventid: string, read?: boolean, userid?: string): Promise<Notification>

    deleteNotification(notificationid: string, userid?: string): Promise<Notification>

    deleteNotificationByChatEventId(chateventid: string, userid?: string): Promise<Notification>

    muteUserInRoom(user: User | string, mute: boolean, expireseconds?: number, room?: ChatRoomResult | string): Promise<ChatRoomResult>

    shadowBanUserFromRoom(user: User | string, expireseconds: number, roomid?: string): Promise<ChatRoomResult>

    getRoomExtendedDetails(request: ChatRoomExtendedDetailsRequest): Promise<ChatRoomExtendedDetailsResponse>
}