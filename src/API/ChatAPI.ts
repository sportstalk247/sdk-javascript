/* istanbul ignore file */

import {
    AdvertisementOptions, ChatUpdatesResult,
    CommandOptions, CommandResponse, DeletedChatRoomResponse,
    EventHandlerConfig, EventListResponse,
    EventResult,
    GoalOptions,
    ChatRoom, ChatRoomExitResult, ChatRoomListResponse,
    ChatRoomResult,
    JoinChatRoomResponse, BounceUserResult, ShadowBanOptions
} from "../models/ChatModels";

import {ISportsTalkConfigurable, IUserConfigurable} from "./CommonAPI";
import {
    ListRequest,
    MessageResult,
    Reaction,
    ReportReason,
    ReportType,
    RestApiResult,
    User, UserDeletionResponse, UserListResponse,
    UserResult, UserSearchType
} from "../models/CommonModels";

/**
 * Interface for the EventService, which handles chat events and any polling.
 * @interface
 */
export interface IChatEventService extends ISportsTalkConfigurable, IUserConfigurable  {
    startEventUpdates(),
    stopEventUpdates(),
    handleUpdates(results: ChatUpdatesResult);
    setCurrentRoom(room: ChatRoomResult | null): ChatRoom | null,
    setEventHandlers(eventHandlers: EventHandlerConfig),
    getCurrentRoom(): ChatRoomResult | null,
    getUpdates(cursor?: string): Promise<ChatUpdatesResult>,
    setUpdatesCursor(cursor: string),
    setPreviousEventsCursor(cursor: string),
    reportMessage(event: EventResult | string, reason: ReportReason): Promise<MessageResult<null>>,
    executeChatCommand(user:User, command: string, options?: CommandOptions):  Promise<MessageResult<CommandResponse>>
    sendThreadedReply(user: User, message: string, replyto: EventResult | string, options?: CommandOptions): Promise<MessageResult<CommandResponse>>
    sendQuotedReply(user: User, message: string, replyto: EventResult |string, options?: CommandOptions): Promise<MessageResult<CommandResponse>>
    reactToEvent(user: User, reaction: Reaction | string, reactToMessage: EventResult | string, options?: CommandOptions): Promise<MessageResult<CommandResponse>>
    sendAdvertisement(user: User, options: AdvertisementOptions): Promise<MessageResult<CommandResponse>>
    sendGoal(user: User, img: string, message?:string, options?: GoalOptions): Promise<MessageResult<CommandResponse>>
    getEventHandlers(): EventHandlerConfig
    flagEventLogicallyDeleted(user: UserResult | string, event:EventResult | string, permanentIfNoReplies:boolean):Promise<RestApiResult<null>>
    permanetlyDeleteEvent(user: UserResult | string, event: EventResult | string):Promise<RestApiResult<null>>
    listPreviousEvents(cursor?:string, limit?: number): Promise<ChatUpdatesResult>
    listEventsHistory(cursor?:string, limit?: number): Promise<ChatUpdatesResult>
    setUpdateSpeed(speed: number);
}

/**
 * Interface for room management
 * @interface
 */
export interface IRoomService extends ISportsTalkConfigurable {
    /**
     * Lists available rooms for an app
     */
    listRooms(cursor?: string, limit?: number): Promise<ChatRoomListResponse>

    /**
     * Gets room details
     * @param room a ChatRoomResult or a string which represents roomID.
     * @returns the ChatRoomResult or null, if no room found.
     */
    getRoomDetails(room:ChatRoomResult | string): Promise<ChatRoomResult | null>

    /**
     * Gets room details
     * @param room a ChatRoomResult or a string which represents customid.
     * @returns the ChatRoomResult or null, if no room found.  If there is no customid set on the ChatRoomResult object, this will return null.
     */
    getRoomDetailsByCustomId(room:ChatRoomResult | string): Promise<ChatRoomResult | null>

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
    getEventById(id:string, roomid?: string): Promise<EventResult>

    /**
     * Will update the room with new values.
     * @param room
     */
    updateRoom(room:ChatRoomResult): Promise<ChatRoomResult>

    /**
     * Will set a room to be in the "closed" state.
     * @param room
     */
    closeRoom(room:ChatRoomResult | string): Promise<ChatRoomResult>

    /**
     * Will set a room to be in the "open" state.
     * @param room
     */
    openRoom(room:ChatRoomResult | string): Promise<ChatRoomResult>

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
    joinRoom(room: ChatRoom | string, user: User): Promise<JoinChatRoomResponse>
    joinRoomByCustomId( room: ChatRoom | string, user: User): Promise<JoinChatRoomResponse>
    exitRoom(user: User | string, room: ChatRoom | string): Promise<ChatRoomExitResult>
}

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
    executeChatCommand(command: string, options?: CommandOptions):  Promise<MessageResult<null | CommandResponse>>
    /**
     * Reply to an event
     * @param message the text that will make up the reply
     * @param replyto the Event that is being replied to or the event ID as a string
     * @param options custom options, will depend on your chat implementation
     */
    sendQuotedReply(message: string, replyto: string, options?: CommandOptions): Promise<MessageResult<null | CommandResponse>>

    /**
     * Reply to an event
     * @param message the text that will make up the reply
     * @param replyto the Event that is being replied to or the event ID as a string
     * @param options custom options, will depend on your chat implementation
     */
    sendThreadedReply(message: string, replyto: string, options?: CommandOptions): Promise<MessageResult<null | CommandResponse>>

    /**
     * Sends an announcement, forces the announcement eventType.  Convenience method around executeChatCommand.
     * @param command
     * @param options
     */
    sendAnnouncement(command:string, options?: CommandOptions): Promise<MessageResult<CommandResponse>>

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
    sendGoal(message?:string, img?: string, options?: GoalOptions): Promise<MessageResult<null | CommandResponse>>

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
    reportMessage(event: EventResult | string, reason: ReportType):  Promise<MessageResult<null>>,

    /**
     * List rooms. Allows you to cursor through longer lists.
     * @param cursor
     * @param limit
     */
    listRooms(cursor?: string, limit?: number): Promise<ChatRoomListResponse>

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
    updateRoom(room:ChatRoomResult): Promise<ChatRoomResult>

    /**
     * Join a chat room
     * @param room or room ID
     * @return Promise the JoinChatRoomResponse from the server.
     */
    joinRoom(room: ChatRoomResult | string): Promise<JoinChatRoomResponse>;

    /**
     * Join a chat room
     * @param room or room customID
     * @return Promise the JoinChatRoomResponse from the server.
     */
    joinRoomByCustomId(room: ChatRoom | string): Promise<JoinChatRoomResponse>;

    /**
     * Gets the current Chatroom.
     * @return ChatRoom
     */
    getCurrentRoom(): ChatRoom | null;

    /**
     * Sets the current room. The room must have an ID and have already been created on the server.
     * @param room
     */
    setCurrentRoom(room:ChatRoomResult);

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
    getEventHandlers():EventHandlerConfig;

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
    createOrUpdateUser(user: User, setDefault?:boolean): Promise<User>

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
    listPreviousEvents(cursor?:string, limit?: number): Promise<ChatUpdatesResult>

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
    setBanStatus(user: User | string, isBanned: boolean): Promise<RestApiResult<UserResult>>

    /**
     * Sets shadowban status for a user.
     * @param user
     * @param options
     */
    setShadowBanStatus(user: User | string, options: ShadowBanOptions): Promise<RestApiResult<UserResult>>

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
    searchUsers(search: string, type: UserSearchType, limit?:number): Promise<UserListResponse>

    /**
     * Lists users.
     * @param request a ListRequest, containing cursor and limit properties.
     */
    listUsers(request?: ListRequest): Promise<UserListResponse>

    /**
     * Deletes a user. Cannot be reversed.
     * @param user a User object with an id or a userid string
     */
    deleteUser(user:User | string):Promise<UserDeletionResponse>

    /**
     * Gets a fresh copy of a user from the server.
     * @param user
     */
    getUserDetails(user: User | string): Promise<UserResult>
    /**
     * Checks if the current user has already reported a message.
     * If no current user set or provided, throws an error;
     * @param event the event to check.  Will evaluate if the given user or default user has reported it.
     * @param user optional. A user to check for reporting.
     * @return boolean true if reported by the given user.
     */
    messageIsReported(event: EventResult, user?:User): Boolean

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
    messageIsReactedTo(event: EventResult, reaction:Reaction | string): Boolean
}

/**
 * Interface for Chat Moderation Services.
 * @interface
 */
export interface IChatModerationService extends ISportsTalkConfigurable {
    listMessagesInModerationQueue(): Promise<EventListResponse>
    moderateEvent(event: EventResult, approved: boolean): Promise<EventResult>
}

