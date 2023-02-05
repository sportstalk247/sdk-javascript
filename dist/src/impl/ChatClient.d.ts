import { AdvertisementOptions, CommandOptions, GoalOptions, EventHandlerConfig, EventResult, CommandResponse, ChatUpdatesResult, BounceUserResult, EffectOptions, EventType, ChatEventsList, TimestampRequest, UserEffectFlags } from "../models/ChatModels";
import { Reaction, SportsTalkConfig, UserTokenRefreshFunction, MessageResult, RestApiResult, ListRequest, ErrorResult } from "../models/CommonModels";
import { IChatClient } from "../API/chat/IChatClient";
import { IChatEventService } from "../API/chat/IEventService";
import { IChatRoomService } from "../API/chat/IChatRoomService";
import { IUserService } from "../API/users/IUserService";
import { ChatRoom, ChatRoomExitResult, ChatRoomExtendedDetailsRequest, ChatRoomExtendedDetailsResponse, ChatRoomListResponse, ChatRoomResult, DeletedChatRoomResponse, JoinChatRoomResponse, UserSubscriptionListResponse } from "../models/chat/ChatRoom";
import { User, UserDeletionResponse, UserListResponse, UserResult, UserSearchType } from "../models/user/User";
import { Notification, NotificationListRequest } from "../models/user/Notifications";
import { ReportType } from "../models/Moderation";
/**
 * ChatClient provides an interface to chat applications.
 * The ChatClient is the primary class you will want to use if you are creating a chat application.
 * Common chat operations are abstracted through this class.
 *
 * NOTE: All operations can throw errors if there are network or server issues.
 * You should ensure that ALL operations that return promises have a catch block or handle errors in some way.
 * @class
 */
export declare class ChatClient implements IChatClient {
    /**
     * Holds the configuration for the ChatClient and Backing services.
     * @private
     */
    private _config;
    private _callBackDelegate;
    /**
     * Holds the current user for the client.
     * @private
     */
    private _user;
    private _lastCommand;
    private _lastCommandTime;
    private _lastCommandTimeoutDuration;
    /**
     * Holds the currently active chat room being observed by the client.
     * A client can observe one room at a time.
     * @private
     */
    private _currentRoom;
    /**
     * Convenience holder for a goal image for the goal API
     * @private
     */
    private _defaultGoalImage;
    /**
     * Holds an event service used by the ChatClient
     * @private
     */
    private _eventService;
    /**
     * Holds the RoomService used by the ChatClient
     * @private
     */
    private _roomService;
    /**
     * Holds the UserService used by the ChatClient
     * @private
     */
    private _userService;
    /**
     * Notification Service
     * @private
     */
    private _notificationServce;
    private _moderationService;
    /**
     * Debugging method to grab the internal state and help debug.
     */
    _getDebug: () => string;
    private _throttle;
    /**
     * Creates a chat client and detects the current domain.
     * @private
     */
    private constructor();
    getTokenExp(): number;
    /**
     * Configures and creates a ChatClient
     * @param config
     * @param eventHandlers
     * @return SportsTalkClient.  Currently only a REST based client is supported.  Future SDK versions will implement other options such as firebase messaging and websockets
     */
    static init: (config?: SportsTalkConfig, eventHandlers?: EventHandlerConfig | undefined) => ChatClient;
    setUserTokenRefreshFunction: (userTokenRefreshFunction: UserTokenRefreshFunction) => void;
    setUserToken: (userToken: string) => void;
    getUserToken: () => Promise<string>;
    refreshUserToken: () => Promise<string>;
    /**
     * Sets the config and creates (if needed) the internal services used to power the Chat.
     * @param config
     */
    setConfig: (config: SportsTalkConfig) => void;
    /**
     * Gets the current config.
     */
    getConfig: () => SportsTalkConfig;
    /**
     * Returns a specific event for the room
     * @param id
     * @param roomid OPTIONAL.  The room id for the room holding the event. Defaults to the current room. If no value passed and no room set, the method will throw an error.
     */
    getEventById: (id: string, roomid?: string | undefined) => Promise<EventResult>;
    /**
     * Sets the default goal image
     * @param url a full URL, e.g. https://yourserver.com/some/image/url.png
     * @return string The url that was set for the goal image.
     */
    setDefaultGoalImage: (url: string) => string;
    /**
     * Set the event handlers to receive chat events
     * @param eventHandlers
     */
    setEventHandlers: (eventHandlers: EventHandlerConfig) => void;
    /**
     * Gets the event handlers
     * @return eventsHandlerconfig The configuration object for event handler functions.
     */
    getEventHandlers: () => EventHandlerConfig;
    /**
     * @return IChatEventService The backing event service.
     */
    getEventService: () => IChatEventService;
    /**
     * Get the current room service.
     * @return IChatRoomService
     */
    getRoomService: () => IChatRoomService;
    /**
     * Start the "talk".  This will being retrieving events from sportstalk servers.
     * If you pass a room parameter, will join the room and then start listening to updates.
     */
    startListeningToEventUpdates: (room?: ChatRoomResult | undefined) => any;
    /**
     * Stop the talk.  No new events will be retrieved.  However, if there are events still in a queue that queue may continue until empty.
     */
    stopListeningToEventUpdates: () => void;
    /**
     * Retrieve available rooms for this chat app.
     */
    listRooms: (cursor?: string | undefined, limit?: number | undefined) => Promise<ChatRoomListResponse>;
    /**
     * List all participants in a room.  Must have joined a room first.
     * @param cursor The cursor, used if you need to scroll through all users and there are over <maxresults> in the room.
     * @param maxresults The maximum number of results, defaults to 200.
     */
    listParticipants: (cursor?: string | undefined, maxresults?: number) => Promise<Array<UserResult>>;
    /**
     * Lists chatroom subscriptions for a user.
     * @param user
     * @param cursor
     */
    listUserSubscribedRooms: (user: User | string, cursor?: any) => Promise<UserSubscriptionListResponse>;
    /**
     * Set the chat user.
     * @param user
     */
    setUser: (user: User) => ChatClient;
    /**
     * Get the current user.
     */
    getCurrentUser: (user?: string | undefined) => User | undefined;
    /**
     * If the user exists, updates the user. Otherwise creates a new user.
     * @param user a User model.  The values of 'banned', 'handlelowercase' and 'kind' are ignored.
     */
    createOrUpdateUser: (user: User, setDefault?: boolean) => Promise<UserResult>;
    /**
     * Get the latest events from the server.  You probably want to use 'startTalk' instead.
     * This method will poll the server a single time for latest events.
     */
    getUpdates: () => Promise<ChatUpdatesResult>;
    /**
     * Join a chat room
     * @param room
     */
    joinRoom: (room: ChatRoomResult | string, ignoreInitialMessages?: boolean) => Promise<JoinChatRoomResponse>;
    /**
     * Join a room by it's customid
     * @param user
     * @param room
     */
    joinRoomByCustomId(room: ChatRoom | string, ignoreInitialMessages?: boolean): Promise<JoinChatRoomResponse>;
    /**
     * Exit a room.
     */
    exitRoom: () => Promise<ChatRoomExitResult>;
    /**
     * Removes all user messages from a room.
     * @param user Optional.  A user whose messages to purge from room.
     * @param room Optional.  The room to purge messages from. Defaults to current room, if set.  Otherwise throws an error.
     */
    purgeUserMessagesFromRoom: (user?: string | UserResult | undefined, room?: string | ChatRoomResult | undefined) => Promise<RestApiResult<null>>;
    /**
     * Gets currently set room.  Returns the current room or undefined if a room has not been joined.
     */
    getCurrentRoom: () => ChatRoomResult | null;
    /**
     * Set the current room state.
     * @param room
     */
    setCurrentRoom: (room: ChatRoomResult) => void;
    getRoomDetails: (room: ChatRoomResult | string) => Promise<ChatRoomResult | null>;
    /**
     * Returns the ChatRoomResult for a given id.
     * @param room
     */
    getRoomDetailsByCustomId: (room: ChatRoomResult | string) => Promise<ChatRoomResult | null>;
    /**
     * Checks if a user is bounced from a room.  If forceRefresh is true, will always ask the server for fresh data.
     * Will also check the server if the current room is just an ID and not a full ChatRoomResult object.
     * @param user
     * @param forceRefresh will force a server update of the room before checking status.
     * @param room optional room, will use current room if not set.
     */
    isUserBouncedFromRoom: (user: User | string, forceRefresh?: boolean | undefined, room?: string | ChatRoomResult | undefined) => Promise<boolean>;
    getUserService: () => IUserService;
    getUserEffects: (user?: string | User | undefined, forceRefresh?: boolean | undefined, room?: string | ChatRoomResult | undefined) => Promise<UserEffectFlags>;
    /**
     * Checks if a user is bounced from a room.  If forceRefresh is true, will always ask the server for fresh data.
     * Will also check the server if the current room is just an ID and not a full ChatRoomResult object.
     * @param user
     * @param forceRefresh will force a server update of the room before checking status
     * @param room optional room, will use current room if not set.
     */
    isUserShadowbanned: (user: User | string, forceRefresh?: boolean | undefined, room?: string | ChatRoomResult | undefined) => Promise<boolean>;
    /**
     * ROOM COMMANDS SECTION
     */
    /**
     * Send a chat command.  Usually only the first param is needed.
     * @param command the chat string, which can also include admin or action commands by starting with `/` or `*`
     * @param options the custom parameters.  See CommandOptions interface for details.
     */
    executeChatCommand: (command: string, options?: CommandOptions | undefined) => Promise<MessageResult<CommandResponse> | ErrorResult>;
    /**
     * Sends an announcement, forces the announcement eventType.  Convenience method around executeChatCommand.
     * @param command
     * @param options
     */
    sendAnnouncement: (command: string, options?: CommandOptions | undefined) => Promise<MessageResult<CommandResponse> | ErrorResult>;
    /**
     * Reply to an event
     * @param message the text that will make up the reply
     * @param replyto the Event that is being replied to or the event ID as a string
     * @param options custom options, will depend on your chat implementation
     */
    sendQuotedReply: (message: string, replyto: EventResult | string, options?: CommandOptions | undefined) => Promise<MessageResult<CommandResponse | null>>;
    /**
     * Reply to an event
     * @param message the text that will make up the reply
     * @param replyto the Event that is being replied to or the event ID as a string
     * @param options custom options, will depend on your chat implementation
     */
    sendThreadedReply: (message: string, replyto: EventResult | string, options?: CommandOptions | undefined) => Promise<MessageResult<CommandResponse | null>>;
    /**
     * React to an event
     * @param reaction
     * @param reactToMessage
     * @param options
     */
    reactToEvent: (reaction: Reaction | string, reactToMessage: EventResult | string, options?: CommandOptions | undefined) => Promise<MessageResult<CommandResponse>>;
    /**
     * Send an advertisement custom event
     * @param options
     */
    sendAdvertisement: (options: AdvertisementOptions) => Promise<MessageResult<null | CommandResponse>>;
    /**
     * Send a goal event.
     * This is a convenience wrapper around custom messagings, if a default image is set, no further parameters are needed.
     *
     * @param message The message to be sent with the goal.  Defaults to GOAL!!!
     * @param img The full url of the image to send as part of the goal, e.g. https://....
     * @param options other custom options to send.
     */
    sendGoal: (message?: string | undefined, img?: string | undefined, options?: GoalOptions | undefined) => Promise<MessageResult<CommandResponse>>;
    /**
     * Flags an event as deleted
     * @param event the event to be deleted.
     * @return the result of the API call.
     */
    flagEventLogicallyDeleted: (event: EventResult | string, permamentifnoreplies?: boolean) => Promise<MessageResult<null>>;
    /**
     * Permanently deletes an event.
     * @param event the event to be deleted.
     * @return the result of the API call.
     */
    permanetlyDeleteEvent: (event: EventResult | string) => Promise<MessageResult<null>>;
    /**
     * Report a chat event for violating community policy.
     * @param event
     * @param type
     */
    reportMessage: (event: EventResult | string, type: ReportType) => Promise<MessageResult<null>>;
    /**
     * Create a new chatroom
     * @param room the Room object describing the room
     * @return the Room created on the server, with a roomID.
     */
    createRoom: (room: ChatRoom) => Promise<ChatRoomResult>;
    /**
     * Update a room that's been created.
     * @param room An already created room with a roomId.
     * @return the updated room information.
     */
    updateRoom: (room: ChatRoomResult) => Promise<ChatRoomResult>;
    deleteRoom: (room: ChatRoomResult) => Promise<DeletedChatRoomResponse>;
    setBanStatus: (user: User | string, isBanned: boolean) => Promise<UserResult>;
    /**
     * Adds or removes the shadowban status on the user.
     * This method is global.  If a room is specified in options it will be ignored.
     * @param user
     * @param options
     */
    setShadowBanStatus: (user: User | string, options: EffectOptions) => Promise<UserResult | ChatRoomResult>;
    shadowBanUserFromRoom: (user: User | string, expireseconds: number, roomid?: string | undefined) => Promise<ChatRoomResult>;
    unShadowBanUserFromRoom: (user: User | string, expireseconds: number, roomid?: string | undefined) => Promise<ChatRoomResult>;
    muteUserInRoom: (user: User | string, mute: boolean, expireseconds?: number | undefined, room?: string | ChatRoomResult | undefined) => Promise<ChatRoomResult>;
    searchUsers: (search: string, type: UserSearchType, limit?: number | undefined) => Promise<UserListResponse>;
    listUsers: (request?: ListRequest | undefined) => Promise<UserListResponse>;
    listEventsByType: (type: EventType) => Promise<ChatEventsList>;
    /**
     * Requests user notifications.
     * Max limit is 100. Requests over this limit will return a maximum of 100 notifications.
     * Calling the API without any parameters will request 50 notifications for the current user.
     * if no user is set, will throw an error.
     * @param request {userid?:string, limit?:number, includeread?:boolean, cursor?: string}
     */
    listUserNotifications: (request?: Partial<NotificationListRequest>) => Promise<any>;
    markAllNotificationsAsRead: (user?: string | User | undefined, deleteAll?: boolean) => Promise<any>;
    setNotificationReadStatus: (notificationid: string, read?: boolean | undefined, userid?: string | undefined) => Promise<Notification>;
    setNotificationReadStatusByChatEventId(chateventid: string, read?: boolean, userid?: string): Promise<Notification>;
    deleteNotification: (notificationid: string, userid?: string | undefined) => Promise<Notification>;
    deleteNotificationByChatEventId: (chateventid: string, userid?: string | undefined) => Promise<Notification>;
    deleteUser: (user: User | string) => Promise<UserDeletionResponse>;
    getUserDetails: (user: User | string) => Promise<UserResult>;
    /**
     * Checks if the current user has already reported a message.
     * If no current user set or provided, throws an error;
     * @param event the event to check.  Will evaluate if the given user or default user has reported it.
     * @param user optional. A user to check for reporting.
     * @return boolean true if reported by the given user.
     */
    messageIsReported: (event: EventResult, user?: string | User | undefined) => Boolean;
    getRoomExtendedDetails: (request: ChatRoomExtendedDetailsRequest) => Promise<ChatRoomExtendedDetailsResponse>;
    /**
     * Checks if a message was reacted to by the current user.
     * @param event The event to evaluate.
     * @param reaction true or false.  Returns false if no user set.
     */
    messageIsReactedTo: (event: EventResult, reaction: Reaction | string) => Boolean;
    /**
     * Lists events older than a given cursor.  Will default to the last known cursor if updates have been triggered.
     * @param cursor
     * @param limit
     */
    listPreviousEvents: (cursor: string, limit?: number) => Promise<ChatUpdatesResult>;
    /**
     * Bounces a user from a room, removing from room and banning them.
     *
     * @param user a UserResult (with id) or a string representing the userid
     * @param message the bounce reason.
     * @return BounceUserResult the result of the command from the server.
     */
    bounceUser: (user: UserResult | string, message: string) => Promise<BounceUserResult>;
    /**
     * Removes a user from the bounce list if they were bounced before. Allows them to rejoin chat.
     *
     * @param user a UserResult (with id) or a string representing the userid
     * @param message the bounce reason.
     * @return BounceUserResult the result of the command from the server.
     */
    unbounceUser: (user: UserResult | string, message: string) => Promise<BounceUserResult>;
    /**
     * Manually set the cursor used to grab new updates.
     * You may want to use this and setPreviousEventsCursor if you are scrolling through a large number of messages
     * and wish to limit the number of events somehow to improve UI responsiveness.
     * @param cursor
     */
    setUpdatesCursor: (cursor: string) => void;
    /**
     * Manually set the cursor holding the oldest event known, for scrollback.
     * You may need to use this if you scroll back a lot
     * @param cursor
     */
    setPreviousEventsCursor: (cursor: string) => void;
    /**
     * Reports a user.
     * @param userToReport the user who is causing problems
     * @param reportedBy The user who is reporting the bad behavior.
     * @param reportType The type of report, either 'abuse' or 'spam'
     * @param room if specified, will not report the user globally but only in the current room.
     */
    reportUser: (userToReport: User | string, reportedBy: User | string, reportType?: ReportType) => Promise<User>;
    reportUserInRoom: (userToReport: User | string, reportedBy: User | string, reportType: ReportType | undefined, room: ChatRoomResult | string) => Promise<ChatRoomResult>;
    updateChatEvent: (event: EventResult | string, body: string, user?: string | User | undefined) => Promise<EventResult>;
    listEventsByTimestamp: (query: TimestampRequest) => Promise<ChatEventsList>;
}
